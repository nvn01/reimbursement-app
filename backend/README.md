# Reimbursement Backend API

Go REST API backend for the reimbursement management system.

## Features

- JWT Authentication
- Role-based access control (Employee, Manager, Finance)
- Reimbursement CRUD operations
- Approval workflow (Manager → Finance)
- PostgreSQL database
- RESTful API design

## Tech Stack

- Go 1.21+
- Gin Web Framework
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## Setup

### Prerequisites

- Go 1.21 or higher
- PostgreSQL database running on 100.100.20.1:5432

### Installation

1. Install dependencies:
```bash
export PATH=$PATH:/usr/local/go/bin
go mod tidy
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run the application:
```bash
go run cmd/api/main.go
```

The server will start on `http://0.0.0.0:8080`

## Default Users

The system comes with three default users:

| Username  | Password     | Role     |
|-----------|--------------|----------|
| karyawan  | karyawan123  | employee |
| manager   | manager123   | manager  |
| finance   | finance123   | finance  |

## API Endpoints

### Authentication

- `POST /api/login` - Login and get JWT token
- `GET /api/profile` - Get current user profile (protected)

### Reimbursements

#### Employee Endpoints
- `POST /api/reimbursements` - Create new reimbursement
- `GET /api/reimbursements` - Get own reimbursements
- `GET /api/reimbursements/:id` - Get reimbursement details
- `PUT /api/reimbursements/:id` - Update pending reimbursement
- `DELETE /api/reimbursements/:id` - Delete pending reimbursement
- `GET /api/reimbursements/stats` - Get own statistics

#### Manager Endpoints
- `GET /api/manager/pending` - Get pending reimbursements
- `POST /api/manager/reimbursements/:id/approve` - Approve/reject reimbursement
- `GET /api/reimbursements` - Get all reimbursements
- `GET /api/reimbursements/stats` - Get overall statistics

#### Finance Endpoints
- `GET /api/finance/pending` - Get manager-approved reimbursements
- `POST /api/finance/reimbursements/:id/approve` - Approve/reject reimbursement
- `GET /api/reimbursements` - Get all reimbursements
- `GET /api/reimbursements/stats` - Get overall statistics

### Admin Endpoints
- `GET /api/users` - Get all users (Manager & Finance only)

## Request Examples

### Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan","password":"karyawan123"}'
```

### Create Reimbursement
```bash
curl -X POST http://localhost:8080/api/reimbursements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Transportation Cost",
    "description": "Taxi to client meeting",
    "category": "transport",
    "amount": 50000,
    "receipt_url": "https://example.com/receipt.jpg"
  }'
```

### Manager Approval
```bash
curl -X POST http://localhost:8080/api/manager/reimbursements/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "action": "approve",
    "notes": "Approved"
  }'
```

## Database Schema

### Users Table
- id (serial primary key)
- username (unique)
- password (hashed)
- full_name
- email (unique)
- role (employee/manager/finance)
- created_at
- updated_at

### Reimbursements Table
- id (serial primary key)
- employee_id (foreign key)
- employee_name
- title
- description
- category (transport/accommodation/meals/office_supply/other)
- amount
- receipt_url
- status (pending/approved_manager/rejected_manager/approved_finance/rejected_finance/completed)
- submitted_date
- manager_id (foreign key, nullable)
- manager_notes (nullable)
- manager_approved (nullable)
- finance_id (foreign key, nullable)
- finance_notes (nullable)
- finance_approved (nullable)
- created_at
- updated_at

## Development

### Build
```bash
go build -o bin/api cmd/api/main.go
```

### Run
```bash
./bin/api
```

## License

MIT
