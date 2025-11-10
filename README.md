# Reimbursement Management System

A full-stack reimbursement management application with role-based access control, approval workflows, and modern UI.

## Tech Stack

### Backend
- **Go 1.21+** - REST API
- **Gin** - Web framework
- **PostgreSQL** - Database (running on 100.100.20.1:5432)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Employee, Manager, Finance)
- Secure password hashing with bcrypt

### Reimbursement Management
- Create, read, update, delete reimbursements
- File upload for receipts
- Category-based organization (Transport, Accommodation, Meals, Office Supply, Other)
- Status tracking through approval workflow

### Approval Workflow
1. **Employee** submits reimbursement → Status: `pending`
2. **Manager** reviews and approves/rejects → Status: `approved_manager` or `rejected_manager`
3. **Finance** reviews manager-approved items → Status: `approved_finance` or `rejected_finance`

### Dashboard Features
- **Employee Dashboard**: Submit and track reimbursements, view statistics
- **Manager Dashboard**: Review pending reimbursements, approve/reject with notes
- **Finance Dashboard**: Process manager-approved reimbursements, final approval

## Project Structure

```
reimbursement-app/
├── backend/
│   ├── cmd/api/              # Application entry point
│   ├── config/               # Configuration management
│   ├── internal/
│   │   ├── database/         # Database connection & migrations
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── middleware/       # Auth & CORS middleware
│   │   ├── models/           # Data models
│   │   └── repository/       # Database operations
│   ├── migrations/           # SQL migration files
│   ├── pkg/utils/            # Utility functions (JWT, password)
│   ├── scripts/              # Setup scripts
│   ├── .env                  # Environment variables
│   ├── Makefile              # Build commands
│   └── start.sh              # Startup script
│
└── frontend/
    ├── app/                  # Next.js app directory
    │   ├── employee/         # Employee dashboard
    │   ├── manager/          # Manager dashboard
    │   ├── finance/          # Finance dashboard
    │   └── login/            # Login page
    ├── components/           # React components
    ├── lib/                  # Utilities & API client
    └── SETUP.md              # Frontend setup guide
```

## Quick Start

### Prerequisites

1. **PostgreSQL Database** running on `100.100.20.1:5432`
2. **Node.js 24+** (installed)
3. **Go 1.21+** (installed)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Configure environment variables:
```bash
# Edit .env file with your database credentials
nano .env
```

Required variables:
```env
DB_HOST=100.100.20.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=reimbursement_db
```

3. Start the backend:
```bash
./start.sh
```

Or using Make:
```bash
make run
```

The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env.local` file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
```

3. Install dependencies (if not already installed):
```bash
npm install --legacy-peer-deps
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Default User Accounts

| Role     | Username  | Password     |
|----------|-----------|--------------|
| Employee | karyawan  | karyawan123  |
| Manager  | manager   | manager123   |
| Finance  | finance   | finance123   |

## API Documentation

Full API documentation is available at: `backend/API_DOCUMENTATION.md`

### Key Endpoints

#### Authentication
- `POST /api/login` - Login and get JWT token
- `GET /api/profile` - Get current user profile

#### Reimbursements (Employee)
- `POST /api/reimbursements` - Create reimbursement
- `GET /api/reimbursements` - Get own reimbursements
- `PUT /api/reimbursements/:id` - Update pending reimbursement
- `DELETE /api/reimbursements/:id` - Delete pending reimbursement

#### Manager Approvals
- `GET /api/manager/pending` - Get pending reimbursements
- `POST /api/manager/reimbursements/:id/approve` - Approve/reject

#### Finance Approvals
- `GET /api/finance/pending` - Get manager-approved reimbursements
- `POST /api/finance/reimbursements/:id/approve` - Final approve/reject

## Database Schema

### Users Table
- User authentication and role management
- Roles: employee, manager, finance

### Reimbursements Table
- Reimbursement requests with full audit trail
- Tracks approval status through workflow
- Stores manager and finance notes

See `backend/migrations/001_init_schema.sql` for complete schema.

## Development

### Backend Development

```bash
cd backend

# Run with hot reload (requires air)
make dev

# Run tests
make test

# Format code
make fmt

# Build binary
make build
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Testing the Application

1. **Start Backend**: `cd backend && ./start.sh`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Login**: Use one of the default accounts
5. **Test Workflow**:
   - Login as Employee → Create reimbursement
   - Login as Manager → Approve reimbursement
   - Login as Finance → Final approval

## Troubleshooting

### Backend Issues

**Database Connection Failed**
- Verify PostgreSQL is running on 100.100.20.1:5432
- Check credentials in `.env` file
- Ensure database `reimbursement_db` exists

**Port Already in Use**
- Change `SERVER_PORT` in `.env` file
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Frontend Issues

**API Connection Failed**
- Ensure backend is running on port 8080
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in backend

**Dependencies Installation Failed**
- Use `npm install --legacy-peer-deps` flag
- Clear npm cache: `npm cache clean --force`

## Production Deployment

### Backend
1. Build binary: `make build`
2. Set production environment variables
3. Run: `./bin/api`
4. Use reverse proxy (nginx/traefik) for HTTPS

### Frontend
1. Build: `npm run build`
2. Start: `npm start`
3. Or deploy to Vercel/Netlify

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Enable database SSL mode
- Use environment-specific credentials

## License

MIT

## Support

For issues or questions, please check:
- Backend API docs: `backend/API_DOCUMENTATION.md`
- Frontend setup: `frontend/SETUP.md`
- Backend README: `backend/README.md`
