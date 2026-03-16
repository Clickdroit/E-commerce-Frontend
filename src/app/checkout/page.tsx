"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { ordersApi, paymentsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ShippingAddress } from "@/lib/types";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!address.name.trim()) errors.name = "Name is required";
    if (!address.line1.trim()) errors.line1 = "Address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!address.country.trim()) errors.country = "Country is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !validate()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: address,
      });

      if (!orderRes.success) {
        setError(orderRes.error.message);
        setLoading(false);
        return;
      }

      // 2. Create payment intent
      const paymentRes = await paymentsApi.createPaymentIntent(orderRes.data.id);
      if (!paymentRes.success) {
        setError(paymentRes.error.message);
        setLoading(false);
        return;
      }

      // 3. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Card element not found");
        setLoading(false);
        return;
      }

      const { error: stripeError } = await stripe.confirmCardPayment(
        paymentRes.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: address.name,
              email: user?.email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/account/orders/${orderRes.data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <ErrorMessage message={error} />}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalPrice())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              id="name"
              label="Full Name"
              value={address.name}
              onChange={(e) => updateAddress("name", e.target.value)}
              error={validationErrors.name}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              id="line1"
              label="Address Line 1"
              value={address.line1}
              onChange={(e) => updateAddress("line1", e.target.value)}
              error={validationErrors.line1}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              id="line2"
              label="Address Line 2 (Optional)"
              value={address.line2}
              onChange={(e) => updateAddress("line2", e.target.value)}
            />
          </div>
          <Input
            id="city"
            label="City"
            value={address.city}
            onChange={(e) => updateAddress("city", e.target.value)}
            error={validationErrors.city}
          />
          <Input
            id="state"
            label="State"
            value={address.state}
            onChange={(e) => updateAddress("state", e.target.value)}
            error={validationErrors.state}
          />
          <Input
            id="postalCode"
            label="Postal Code"
            value={address.postalCode}
            onChange={(e) => updateAddress("postalCode", e.target.value)}
            error={validationErrors.postalCode}
          />
          <Input
            id="country"
            label="Country"
            value={address.country}
            onChange={(e) => updateAddress("country", e.target.value)}
            error={validationErrors.country}
          />
        </div>
      </div>

      {/* Payment */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
        <div className="border border-gray-300 rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#374151",
                  "::placeholder": { color: "#9CA3AF" },
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={loading}
        disabled={!stripe}
      >
        Pay {formatCurrency(totalPrice())}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to checkout</h1>
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Configured</h1>
        <p className="text-gray-500">
          Stripe publishable key is not set. Please configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
