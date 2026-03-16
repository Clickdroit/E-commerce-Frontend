"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ShopFront
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link href="/tracking" className="text-sm text-gray-600 hover:text-gray-900">
              Track Order
            </Link>
            <Link href="/cart" className="relative text-sm text-gray-600 hover:text-gray-900">
              Cart
              {totalItems() > 0 && (
                <span className="absolute -top-2 -right-4 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  href="/account/orders"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  My Orders
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/products"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            <Link href="/tracking" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              Track Order
            </Link>
            <Link href="/cart" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              Cart ({totalItems()})
            </Link>
            {user ? (
              <>
                <Link href="/account/orders" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/products" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-gray-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
