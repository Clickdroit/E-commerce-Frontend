import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order - ShopFront",
  description: "Track your order status and shipment information",
};

async function getTrackingData(trackingNumber: string) {
  try {
    const res = await ordersApi.track(trackingNumber);
    if (res.success) return res.data;
    return null;
  } catch {
    return null;
  }
}

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const params = await searchParams;
  const trackingNumber = params.tracking;
  const trackingData = trackingNumber ? await getTrackingData(trackingNumber) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Track Your Order</h1>

      <form className="flex gap-3 mb-8">
        <input
          name="tracking"
          type="text"
          defaultValue={trackingNumber || ""}
          placeholder="Enter tracking number..."
          className="flex-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Track
        </button>
      </form>

      {trackingNumber && !trackingData && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-700">
            No order found with tracking number &ldquo;{trackingNumber}&rdquo;.
          </p>
        </div>
      )}

      {trackingData && (
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Order ID</dt>
                <dd className="font-medium text-gray-900">{trackingData.order.id}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trackingData.order.status)}`}
                  >
                    {trackingData.order.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Total</dt>
                <dd className="font-medium text-gray-900">
                  {formatCurrency(trackingData.order.total)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Ordered</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(trackingData.order.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="space-y-2">
              {trackingData.order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Info */}
          {trackingData.shipment && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Carrier</dt>
                  <dd className="font-medium text-gray-900">
                    {trackingData.shipment.carrier}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trackingData.shipment.status)}`}
                    >
                      {trackingData.shipment.status.replace(/_/g, " ")}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tracking Number</dt>
                  <dd className="font-medium text-gray-900">
                    {trackingData.shipment.trackingNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Est. Delivery</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(trackingData.shipment.estimatedDelivery)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
