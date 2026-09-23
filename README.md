# ROLEX — Events & Caterers Luxury Operations Suite

Bespoke Royal Feasts, Grand Banquet Operations, and Equipment Logistics Management System.

## Architecture & Features

- **Frontend**: TanStack Start, React 19, TypeScript, Tailwind CSS, Lucide Icons, Sonner Notifications.
- **Backend**: FastAPI (Python 3.10) with JWT Authentication, Pydantic schemas, and SQLAlchemy ORM.
- **Database**: PostgreSQL with automatic fallback to high-performance local SQLite storage (`rolex.db`).
- **Core Modules**:
  - **Dashboard**: Operational pulse, today's schedule, equipment shortages, and pending receivables.
  - **Events**: Banquet management, guest counts, preparation workflows, and menus.
  - **Stock & Equipment**: Real-time warehouse availability, reservation tracking, and shortage alerts.
  - **Clients**: Client directory, spending history, direct phone and WhatsApp communications.
  - **Settings**: Simple & modern administration console with multi-admin credential control and branding settings.

## Getting Started

### 1. Backend Server
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Development Server
```bash
bun dev
```

Default administrative access credentials:
- **Username**: `ADMIN`
- **Password**: `ADMIN`
