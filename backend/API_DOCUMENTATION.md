# Reimbursement API Documentation

Base URL: `http://localhost:8080/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Public Endpoints

#### Health Check
```http
GET /api/health
```

Response:
```json
{
  "status": "ok"
}
```

#### Login
```http
POST /api/login
```

Request Body:
```json
{
  "username": "karyawan",
  "password": "karyawan123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "karyawan",
    "full_name": "Employee User",
    "email": "karyawan@company.com",
    "role": "employee",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Protected Endpoints

#### Get Profile
```http
GET /api/profile
```

Response: User object

#### Get All Reimbursements
```http
GET /api/reimbursements
```

- Employees: Returns only their own reimbursements
- Managers/Finance: Returns all reimbursements

Response:
```json
[
  {
    "id": 1,
    "employee_id": 1,
    "employee_name": "Employee User",
    "title": "Transportation Cost",
    "description": "Taxi to client meeting",
    "category": "transport",
    "amount": 50000,
    "receipt_url": "https://example.com/receipt.jpg",
    "status": "pending",
    "submitted_date": "2024-01-01T10:00:00Z",
    "manager_id": null,
    "manager_notes": null,
    "manager_approved": null,
    "finance_id": null,
    "finance_notes": null,
    "finance_approved": null,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

#### Get Reimbursement by ID
```http
GET /api/reimbursements/:id
```

Response: Single reimbursement object

#### Get Statistics
```http
GET /api/reimbursements/stats
```

Response:
```json
{
  "total_submitted": 10,
  "total_approved": 5,
  "total_rejected": 2,
  "total_pending": 3,
  "total_amount": 500000
}
```

### Employee Endpoints

#### Create Reimbursement
```http
POST /api/reimbursements
```

Request Body:
```json
{
  "title": "Transportation Cost",
  "description": "Taxi to client meeting",
  "category": "transport",
  "amount": 50000,
  "receipt_url": "https://example.com/receipt.jpg"
}
```

Categories: `transport`, `accommodation`, `meals`, `office_supply`, `other`

Response: Created reimbursement object

#### Update Reimbursement
```http
PUT /api/reimbursements/:id
```

Request Body (all fields optional):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "meals",
  "amount": 75000,
  "receipt_url": "https://example.com/new-receipt.jpg"
}
```

Note: Can only update reimbursements with status "pending"

Response: Updated reimbursement object

#### Delete Reimbursement
```http
DELETE /api/reimbursements/:id
```

Note: Can only delete reimbursements with status "pending"

Response:
```json
{
  "message": "Reimbursement deleted successfully"
}
```

### Manager Endpoints

#### Get Pending Reimbursements
```http
GET /api/manager/pending
```

Returns all reimbursements with status "pending"

Response: Array of reimbursement objects

#### Approve/Reject Reimbursement
```http
POST /api/manager/reimbursements/:id/approve
```

Request Body:
```json
{
  "action": "approve",
  "notes": "Approved for business purpose"
}
```

Action: `approve` or `reject`

Response: Updated reimbursement object with status:
- `approved_manager` (if approved)
- `rejected_manager` (if rejected)

### Finance Endpoints

#### Get Pending Reimbursements
```http
GET /api/finance/pending
```

Returns all reimbursements with status "approved_manager"

Response: Array of reimbursement objects

#### Approve/Reject Reimbursement
```http
POST /api/finance/reimbursements/:id/approve
```

Request Body:
```json
{
  "action": "approve",
  "notes": "Payment processed"
}
```

Action: `approve` or `reject`

Response: Updated reimbursement object with status:
- `approved_finance` (if approved)
- `rejected_finance` (if rejected)

### Admin Endpoints (Manager & Finance)

#### Get All Users
```http
GET /api/users
```

Response: Array of user objects

## Status Flow

1. **pending** - Initial status when employee creates reimbursement
2. **approved_manager** - Manager approves the reimbursement
3. **rejected_manager** - Manager rejects the reimbursement (final)
4. **approved_finance** - Finance approves the reimbursement (final)
5. **rejected_finance** - Finance rejects the reimbursement (final)

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Default Users

| Username  | Password     | Role     |
|-----------|--------------|----------|
| karyawan  | karyawan123  | employee |
| manager   | manager123   | manager  |
| finance   | finance123   | finance  |
