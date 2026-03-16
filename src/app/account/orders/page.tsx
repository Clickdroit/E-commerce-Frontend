"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { Order, PaginatedData } from "@/lib/types";

function OrdersList() {
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
      const res = await ordersApi.listMine({ page, limit: 10 });
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => setRetryKey((k) => k + 1)} />;

  return (
    <>
      {!orders || orders.items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.items.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">
                  Order #{order.id.slice(0, 8)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(order.createdAt)}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      {orders && (
        <Pagination page={orders.page} totalPages={orders.totalPages} onPageChange={setPage} />
      )}
    </>
  );
}

export default function AccountOrdersPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
        <OrdersList />
      </div>
    </AuthGuard>
  );
}
