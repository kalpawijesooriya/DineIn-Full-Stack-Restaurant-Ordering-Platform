# DineIn Full-Stack Restaurant Ordering Platform

A complete restaurant ordering ecosystem with five connected applications:
- Customer mobile app (Expo React Native)
- Customer web ordering app (React + Vite)
- Kitchen display app (React + Vite)
- Admin and cashier app (React + Vite)
- .NET 9 backend API (Clean Architecture + SignalR)

## Repository Structure

- `dine-in-api` -> .NET 9 backend (JWT auth, role-based policies, EF Core, SignalR)
- `dine-in-admin` -> Admin dashboard + Cashier POS web app
- `dine-in-kitchen` -> Kitchen display web app
- `dine-in-order` -> Customer web ordering app
- `dine-in-app` -> Customer mobile app (Expo)

## Core Features

- Real-time order updates via SignalR
- Role-based access (`admin`, `cashier`)
- Cashier POS with deferred payment support
- Kitchen workflow board (order lifecycle states)
- Customer ordering experience across web and mobile for dine-in, pickup, and delivery
- Menu customization groups/options management

## Tech Stack

### Backend
- .NET 9 Web API
- Entity Framework Core
- SQL Server
- SignalR
- JWT Authentication

### Frontend
- React 19 + Vite (admin, kitchen, customer web ordering)
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

### 4) Customer Web Ordering App

```bash
cd dine-in-order
npm install
npm run dev
```

### 5) Mobile App

```bash
cd dine-in-app
npm install
npm run start
```

Then open in Expo Go (or Android/iOS simulator).

## Default Credentials

- Admin: `admin` / `admin123`
- Cashier: `cashier` / `cashier123`

## CI/CD & Deployment

The project includes GitHub Actions workflows that trigger on push to `master`.

### Frontend — GitHub Pages

**Workflow:** `.github/workflows/deploy-frontend.yml`

Builds and deploys all three web apps to GitHub Pages under subdirectories:

| App | Path | Local Port |
|-----|------|------------|
| Admin Dashboard | `/admin` | 5174 |
| Kitchen Display | `/kitchen` | 5173 |
| Customer Ordering | `/order` | 5175 |

A landing page at the root links to all three apps.

**Path filter:** Only triggers when files in `dine-in-admin/`, `dine-in-kitchen/`, or `dine-in-order/` change.

**Setup required:**
1. Go to repo **Settings → Pages → Source** and select **GitHub Actions**

### API — GitHub Container Registry (GHCR)

**Workflow:** `.github/workflows/deploy-api.yml`

Builds a Docker image for the .NET 9 API and pushes it to GHCR.

**Path filter:** Only triggers when files in `dine-in-api/` change.

**Image:** `ghcr.io/<owner>/<repo>/dine-in-api:latest`

**Run the image:**
```bash
docker run -p 8080:8080 ghcr.io/<owner>/<repo>/dine-in-api:latest
```

> Both workflows also support manual dispatch via `workflow_dispatch`.

## Docker

### API

Build and run the API locally with Docker:

```bash
cd dine-in-api
docker build -t dine-in-api .
docker run -p 8080:8080 dine-in-api
```

The API will be available at `http://localhost:8080`.

## Notes

- Keep all projects in this monorepo; `dine-in-app` is now part of the same repository.
- If ports or API URL differ, update each app's API client config accordingly.

## License

Add your preferred license here.
