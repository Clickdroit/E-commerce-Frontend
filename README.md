# ShopFront – E-Commerce Frontend

A complete e-commerce frontend built with **Next.js** (App Router), **TypeScript**, and **Tailwind CSS** that consumes a REST API.

## Features

### Public Pages
- **Home** – Paginated and searchable product listing
- **Product Detail** – Stock level with real-time WebSocket updates
- **Cart** – Client-side cart managed with Zustand (persisted to localStorage)
- **Checkout** – Create order + Stripe Elements card payment
- **Order Tracking** – SSR page for SEO, search by tracking number
- **Login / Register** – Form validation, JWT authentication

### Authenticated Pages
- `/account/orders` – List current user's orders with status
- `/account/orders/[id]` – Order detail with shipment info

### Admin Pages (role-based access)
- `/admin/products` – List, create, edit products, update stock
- `/admin/orders` – List all orders
- `/admin/shipments` – Update shipment status
- `/admin/refunds` – Trigger refund for an order

## Technical Details

- **API Client** (`src/lib/api.ts`) – Centralized fetch wrapper with automatic JWT refresh on 401
- **Auth** – JWT access token in memory, refresh token via httpOnly cookie
- **State** – Zustand stores for auth and cart
- **WebSocket** – Real-time stock updates on product detail page
- **Stripe** – `@stripe/react-stripe-js` for card input via Stripe Elements
- **Responsive** – Mobile-first design with Tailwind CSS
- **Validation** – Client-side form validation on all forms
- **Error Handling** – Loading states and error messages on every async action

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port shown in terminal).

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── AppShell.tsx        # Client shell (header, footer, auth init)
│   ├── page.tsx            # Home – product listing
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── products/[id]/      # Product detail
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout with Stripe
│   ├── tracking/           # Order tracking (SSR)
│   ├── account/orders/     # User orders
│   └── admin/              # Admin dashboard
│       ├── layout.tsx      # Admin layout with sidebar nav
│       ├── products/       # Product management
│       ├── orders/         # All orders
│       ├── shipments/      # Shipment management
│       └── refunds/        # Refund management
├── components/
│   ├── auth/               # AuthGuard, AdminGuard
│   ├── layout/             # Header, Footer
│   └── ui/                 # Button, Input, LoadingSpinner, etc.
├── hooks/
│   └── useWebSocket.ts     # WebSocket hook for stock updates
├── lib/
│   ├── api.ts              # Centralized API client
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
└── store/
    ├── auth.ts             # Auth Zustand store
    └── cart.ts             # Cart Zustand store
```

## API Response Format

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { message, code, details } }
```