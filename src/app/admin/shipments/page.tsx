"use client";

import { useEffect, useState } from "react";
import { shipmentsApi } from "@/lib/api";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { Shipment, ShipmentStatus, PaginatedData } from "@/lib/types";

const STATUSES: ShipmentStatus[] = [
  "pending",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<PaginatedData<Shipment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("pending");
  const [updating, setUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await shipmentsApi.list({ page, limit: 20 });
      if (cancelled) return;
      if (res.success) {
        setShipments(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const handleUpdate = async (id: string) => {
    setUpdating(true);
    const res = await shipmentsApi.update(id, { status: newStatus });
    setUpdating(false);
    if (res.success) {
      setEditing(null);
      setRefreshKey((k) => k + 1);
    } else {
      setError(res.error.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipments</h2>

      {error && <div className="mb-4"><ErrorMessage message={error} onRetry={() => setRefreshKey((k) => k + 1)} /></div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Tracking #</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Carrier</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Est. Delivery</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments?.items.map((shipment) => (
                <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {shipment.trackingNumber}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{shipment.carrier}</td>
                  <td className="py-3 px-2">
                    {editing === shipment.id ? (
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}
                      >
                        {shipment.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {formatDate(shipment.estimatedDelivery)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {editing === shipment.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          isLoading={updating}
                          onClick={() => handleUpdate(shipment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        onClick={() => {
                          setEditing(shipment.id);
                          setNewStatus(shipment.status);
                        }}
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shipments && (
        <Pagination
          page={shipments.page}
          totalPages={shipments.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
