"use client";

import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { Order, PaginatedData } from "@/lib/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<PaginatedData<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await ordersApi.listAll({ page, limit: 20 });
      if (cancelled) return;
      if (res.success) {
        setOrders(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [page, retryKey]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">All Orders</h2>

      {error && <div className="mb-4"><ErrorMessage message={error} onRetry={() => setRetryKey((k) => k + 1)} /></div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Items</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders?.items.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{order.items.length}</td>
                  <td className="py-3 px-2 text-right font-medium">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders && (
        <Pagination page={orders.page} totalPages={orders.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
