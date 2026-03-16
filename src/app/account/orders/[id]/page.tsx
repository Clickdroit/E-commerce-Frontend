"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersApi, shipmentsApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { Order, Shipment } from "@/lib/types";

function OrderDetail() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await ordersApi.get(params.id);
      if (res.success) {
        setOrder(res.data);
        // Try to get shipment
        if (res.data.trackingNumber) {
          const shipRes = await shipmentsApi.get(res.data.id);
          if (shipRes.success) {
            setShipment(shipRes.data);
          }
        }
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Order #{order.id.slice(0, 8)}
          </h2>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
          >
            {order.status}
          </span>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium text-gray-900">{formatDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Total</dt>
            <dd className="font-medium text-gray-900">{formatCurrency(order.total)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tracking #</dt>
            <dd className="font-medium text-gray-900">
              {order.trackingNumber || "Not yet available"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Items</dt>
            <dd className="font-medium text-gray-900">{order.items.length}</dd>
          </div>
        </dl>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <address className="text-sm text-gray-600 not-italic">
          <p>{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </address>
      </div>

      {/* Shipment */}
      {shipment && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Carrier</dt>
              <dd className="font-medium text-gray-900">{shipment.carrier}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}
                >
                  {shipment.status.replace(/_/g, " ")}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Tracking Number</dt>
              <dd className="font-medium text-gray-900">{shipment.trackingNumber}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Est. Delivery</dt>
              <dd className="font-medium text-gray-900">
                {formatDate(shipment.estimatedDelivery)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderDetail />
      </div>
    </AuthGuard>
  );
}
