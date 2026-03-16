"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Start shopping to add items to your cart.</p>
        <Link href="/">
          <Button className="mt-6">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="h-20 w-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {item.product.images?.[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.id}`}
                className="font-medium text-gray-900 hover:text-indigo-600 truncate block"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-500">
                {formatCurrency(item.product.price)} each
              </p>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-900"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="px-3 py-1 border-x border-gray-300 text-sm">
                {item.quantity}
              </span>
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-900"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                +
              </button>
            </div>

            <p className="font-medium text-gray-900 w-24 text-right">
              {formatCurrency(item.product.price * item.quantity)}
            </p>

            <button
              onClick={() => removeItem(item.product.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label="Remove item"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(totalPrice())}</span>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={clearCart}>
            Clear Cart
          </Button>
          <Link href="/checkout" className="flex-1">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
