# Frontend Setup Guide

## Environment Configuration

Create a `.env.local` file in the frontend directory with the following content:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

This configures the frontend to connect to the backend API running on port 8080.

## Installation

```bash
npm install --legacy-peer-deps
```

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

### Employee
- Username: `karyawan`
- Password: `karyawan123`

### Manager
- Username: `manager`
- Password: `manager123`

### Finance
- Username: `finance`
- Password: `finance123`

## API Integration

The frontend uses the API service located at `/lib/api.ts` which provides:

- **authAPI**: Login, logout, profile management
- **reimbursementAPI**: CRUD operations for reimbursements
- **managerAPI**: Manager approval endpoints
- **financeAPI**: Finance approval endpoints
- **adminAPI**: User management

All API calls automatically include the JWT token from localStorage.
