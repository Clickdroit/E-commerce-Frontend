"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productsApi } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useStockWebSocket } from "@/hooks/useWebSocket";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const wsStock = useStockWebSocket(params.id);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await productsApi.get(params.id);
      if (res.success) {
        setProduct(res.data);
      } else {
        setError(res.error.message);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const currentStock = wsStock ?? product?.stock ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ ...product, stock: currentStock }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ErrorMessage message={error} />
    </div>
  );
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Category: {product.category}</p>
          <p className="text-3xl font-bold text-gray-900 mt-4">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                currentStock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentStock > 0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {currentStock} in stock
                </>
              ) : (
                "Out of stock"
              )}
            </span>
            {wsStock !== null && (
              <span className="text-xs text-gray-400">Live</span>
            )}
          </div>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              disabled={currentStock === 0}
              onClick={handleAddToCart}
            >
              {added ? "✓ Added!" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
