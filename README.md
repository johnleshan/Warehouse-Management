# AI Warehouse Management System (WMS)

A comprehensive, AI-powered Warehouse Management System built as a single-page web application. This application serves as the central "brain" for warehouse operations, featuring inventory tracking, order processing, worker performance monitoring, and AI-driven insights.

## Features

- **Dashboard**: High-level overview with KPI cards and AI Daily Insights.
- **Inventory Management**: Full CRUD operations for products with low stock alerts.
- **Order Processing**:
  - **Receiving**: Add stock from suppliers.
  - **Outgoing**: Process sales and subtract stock.
- **Worker Performance**: Track tasks and calculate efficiency scores.
- **Smart Reports**:
  - **Burn Rate**: Analyze daily sales velocity.
  - **Reorder Points**: AI suggestions for when to restock.
  - **Forecasting**: Predict stockout dates.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI Components**: Shadcn/UI, Radix UI, Lucide Icons
- **Charts**: Recharts
- **Data**: LocalStorage (Offline-first prototype) / Supabase (SQL Schema provided)

## Getting Started

### Prerequisites

- Node.js 18+ installed.

### Installation

1.  Navigate to the project directory:
    ```bash
    cd "Warehouse Management 2"
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

For this local prototype, the app uses **LocalStorage** to persist data in your browser.
To switch to a real database (Supabase), use the provided `schema.sql` file to set up your PostgreSQL tables and update `lib/storage.ts` to fetch from the API.

## AI Logic

The AI engine (`lib/ai.ts`) calculates:
- **Burn Rate**: `(Total Sold / Days Pattern)`
- **Reorder Point**: `Burn Rate * Lead Time (3 days)`

## Authentication

This local prototype is designed for **offline/single-user usage** and does **not** require a login.
- **Username**: N/A (Auto-login)
- **Password**: N/A

Just open the browser to the local URL (default: `http://localhost:3000`) to access the full dashboard.

