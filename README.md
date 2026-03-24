# DineIn Full-Stack Restaurant Ordering Platform

A complete restaurant ordering ecosystem with four connected applications:
- Customer mobile app (Expo React Native)
- Kitchen display app (React + Vite)
- Admin and cashier app (React + Vite)
- .NET 9 backend API (Clean Architecture + SignalR)

## Repository Structure

- `dine-in-api` -> .NET 9 backend (JWT auth, role-based policies, EF Core, SignalR)
- `dine-in-admin` -> Admin dashboard + Cashier POS web app
- `dine-in-kitchen` -> Kitchen display web app
- `dine-in-app` -> Customer mobile app (Expo)

## Core Features

- Real-time order updates via SignalR
- Role-based access (`admin`, `cashier`)
- Cashier POS with deferred payment support
- Kitchen workflow board (order lifecycle states)
- Customer ordering for dine-in, pickup, and delivery
- Menu customization groups/options management

## Tech Stack

### Backend
- .NET 9 Web API
- Entity Framework Core
- SQL Server
- SignalR
- JWT Authentication

### Frontend
- React 19 + Vite (admin, kitchen)
- Tailwind CSS
- React Native + Expo (mobile app)
- TypeScript

## Prerequisites

- Node.js 20+
- npm 10+
- .NET SDK 9
- SQL Server (local or Docker)

## Quick Start

### 1) API

```bash
cd dine-in-api
dotnet restore
dotnet run --project src/DineIn.API/DineIn.API.csproj
```

Default API base URL:
- `http://localhost:5038`

### 2) Admin + Cashier App

```bash
cd dine-in-admin
npm install
npm run dev
```

### 3) Kitchen App

```bash
cd dine-in-kitchen
npm install
npm run dev
```

### 4) Mobile App

```bash
cd dine-in-app
npm install
npm run start
```

Then open in Expo Go (or Android/iOS simulator).

## Default Credentials

- Admin: `admin` / `admin123`
- Cashier: `cashier` / `cashier123`

## Notes

- Keep all projects in this monorepo; `dine-in-app` is now part of the same repository.
- If ports or API URL differ, update each app's API client config accordingly.

## License

Add your preferred license here.
