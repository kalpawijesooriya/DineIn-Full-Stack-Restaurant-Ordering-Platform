# dine-in-order

Customer Web Ordering App for the DineIn platform.

## Overview

`dine-in-order` is the customer-facing web ordering experience (web equivalent of the `dine-in-app` mobile app). Customers can browse the menu, customize items, place dine-in/pickup/delivery orders, and track order progress in real time.

- App URL (dev): `http://localhost:5175`
- API base URL: `http://localhost:5038/api` (via `VITE_API_BASE_URL`)

## Tech Stack

- React 19
- Vite 8
- TypeScript 5.9
- Tailwind CSS 4
- Zustand
- React Router v7
- SignalR (`@microsoft/signalr`)

## App Flow & Routes

- `/` - Home: order type selection (Dine-In, Pickup, Delivery); table number modal for dine-in
- `/menu` - Menu: category tabs, search, responsive item grid, item detail modal
- `/cart` - Cart: review items, update quantities, remove items, totals
- `/checkout` - Checkout: contact info, conditional delivery address, payment method, place order
- `/confirmation/:id` - Order confirmation success screen
- `/tracker/:id` - Real-time order tracking via SignalR

## Key Features

- Mobile-first responsive design
- Real-time order tracking with SignalR
- Cart persistence across refreshes (localStorage)
- Item customizations (sizes, toppings, etc.)
- Dine-in, pickup, and delivery order types
- Skeleton loading states and toast notifications
- Error boundary for crash recovery
- Accessibility support (ARIA roles, keyboard navigation)

## Project Structure

```text
src/
├── api/          # API client and endpoint modules
├── components/
│   ├── cart/     # Cart item row, summary
│   ├── checkout/ # Contact form, address form, payment selector
│   ├── layout/   # Header, floating cart button, layout shell
│   ├── menu/     # Category tabs, item card, search, customization, item detail modal
│   ├── order/    # Order progress stepper, order details
│   └── ui/       # Reusable primitives (Button, Card, Modal, Badge, Input, Skeleton, Toast, etc.)
├── constants/    # App config (tax rate, delivery fee)
├── hooks/        # useMenu, useOrderTracking, useFormatCurrency
├── pages/        # Route-level page components
├── store/        # Zustand stores (cart with localStorage persistence, order)
└── types/        # TypeScript interfaces
```

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running (`dine-in-api`)

## Setup

```bash
npm install
```

Create `.env` in project root:

```env
VITE_API_BASE_URL=http://localhost:5038/api
```

## Scripts

- `npm run dev` - Start Vite dev server (default `http://localhost:5175`)
- `npm run build` - Type-check and build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
