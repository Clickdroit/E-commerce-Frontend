"use client";

import { useEffect, useState, useCallback } from "react";
import { productsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { Product, PaginatedData, CreateProductData } from "@/lib/types";

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Product;
  onSubmit: (data: CreateProductData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateProductData>({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price || 0,
    stock: initial?.stock || 0,
    images: initial?.images || [],
    category: initial?.category || "",
  });
  const [imageInput, setImageInput] = useState(initial?.images?.join(", ") || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (form.price <= 0) e.price = "Must be positive";
    if (form.stock < 0) e.stock = "Cannot be negative";
    if (!form.category.trim()) e.category = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      images: imageInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold">
        {initial ? "Edit Product" : "Create Product"}
      </h3>
      <Input
        id="name"
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          label="Price (cents)"
          type="number"
          value={String(form.price)}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          error={errors.price}
        />
        <Input
          id="stock"
          label="Stock"
          type="number"
          value={String(form.stock)}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          error={errors.stock}
        />
      </div>
      <Input
        id="category"
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        error={errors.category}
      />
      <Input
        id="images"
        label="Image URLs (comma-separated)"
        value={imageInput}
        onChange={(e) => setImageInput(e.target.value)}
      />
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          {initial ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<PaginatedData<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<"hidden" | "create" | "edit">("hidden");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stockEditing, setStockEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await productsApi.list({ page, limit: 10 });
      if (cancelled) return;
      if (res.success) {
        setProducts(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const handleCreate = async (data: CreateProductData) => {
    setSubmitting(true);
    const res = await productsApi.create(data);
    setSubmitting(false);
    if (res.success) {
      setFormMode("hidden");
      refresh();
    } else {
      setError(res.error.message);
    }
  };

  const handleEdit = async (data: CreateProductData) => {
    if (!editProduct) return;
    setSubmitting(true);
    const res = await productsApi.update(editProduct.id, data);
    setSubmitting(false);
    if (res.success) {
      setFormMode("hidden");
      setEditProduct(null);
      refresh();
    } else {
      setError(res.error.message);
    }
  };

  const handleStockUpdate = async (productId: string) => {
    const stock = parseInt(stockValue, 10);
    if (isNaN(stock) || stock < 0) return;
    const res = await productsApi.updateStock(productId, stock);
    if (res.success) {
      setStockEditing(null);
      refresh();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        {formMode === "hidden" && (
          <Button onClick={() => setFormMode("create")}>Add Product</Button>
        )}
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {formMode !== "hidden" && (
        <div className="mb-6">
          <ProductForm
            initial={formMode === "edit" ? editProduct! : undefined}
            onSubmit={formMode === "create" ? handleCreate : handleEdit}
            onCancel={() => {
              setFormMode("hidden");
              setEditProduct(null);
            }}
            loading={submitting}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Price</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Stock</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Category</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.items.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-2">{formatCurrency(product.price)}</td>
                  <td className="py-3 px-2">
                    {stockEditing === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                        />
                        <button
                          className="text-indigo-600 text-xs font-medium"
                          onClick={() => handleStockUpdate(product.id)}
                        >
                          Save
                        </button>
                        <button
                          className="text-gray-400 text-xs"
                          onClick={() => setStockEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-gray-900 hover:text-indigo-600"
                        onClick={() => {
                          setStockEditing(product.id);
                          setStockValue(String(product.stock));
                        }}
                      >
                        {product.stock}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{product.category}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      onClick={() => {
                        setEditProduct(product);
                        setFormMode("edit");
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products && (
        <Pagination page={products.page} totalPages={products.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
