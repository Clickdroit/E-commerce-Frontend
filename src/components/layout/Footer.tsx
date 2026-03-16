import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              ShopFront
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your trusted online store for quality products.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-sm text-gray-500 hover:text-gray-700">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-700">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Account
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} ShopFront. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
