"use client";

import { useEffect, useState } from "react";
import { refundsApi } from "@/lib/api";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { Refund, PaginatedData } from "@/lib/types";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<PaginatedData<Refund> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await refundsApi.list({ page, limit: 20 });
      if (cancelled) return;
      if (res.success) {
        setRefunds(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!orderId.trim()) e.orderId = "Order ID is required";
    if (!amount || Number(amount) <= 0) e.amount = "Amount must be positive";
    if (!reason.trim()) e.reason = "Reason is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    const res = await refundsApi.create(orderId, {
      amount: Number(amount),
      reason,
    });
    setSubmitting(false);

    if (res.success) {
      setShowForm(false);
      setOrderId("");
      setAmount("");
      setReason("");
      setRefreshKey((k) => k + 1);
    } else {
      setError(res.error.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Refunds</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Issue Refund</Button>
        )}
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {showForm && (
        <form
          onSubmit={handleRefund}
          className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4"
        >
          <h3 className="text-lg font-semibold">Issue Refund</h3>
          <Input
            id="orderId"
            label="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            error={formErrors.orderId}
          />
          <Input
            id="amount"
            label="Amount (cents)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={formErrors.amount}
          />
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              id="reason"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {formErrors.reason && (
              <p className="mt-1 text-sm text-red-600">{formErrors.reason}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="danger" isLoading={submitting}>
              Issue Refund
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Refund ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Reason</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {refunds?.items.map((refund) => (
                <tr key={refund.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {refund.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{refund.orderId.slice(0, 8)}</td>
                  <td className="py-3 px-2">{formatCurrency(refund.amount)}</td>
                  <td className="py-3 px-2 text-gray-500 max-w-[200px] truncate">
                    {refund.reason}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(refund.status)}`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{formatDate(refund.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {refunds && (
        <Pagination
          page={refunds.page}
          totalPages={refunds.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
