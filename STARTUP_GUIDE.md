# 🚀 Startup Guide - Reimbursement Management System

## Prerequisites Check

Before starting, ensure you have:

- ✅ **PostgreSQL** running on `100.100.20.1:5432`
- ✅ **Node.js 24.11.0** installed
- ✅ **Go 1.21.5** installed
- ✅ **npm 11.6.1** installed

## Step-by-Step Startup

### Step 1: Configure Database

1. **Update backend `.env` file** with your PostgreSQL credentials:

```bash
cd /home/nvn/Desktop/reimbursement-app/backend
nano .env
```

Update the `DB_PASSWORD` field:
```env
DB_PASSWORD=your_actual_postgres_password
```

2. **Create the database** (if it doesn't exist):

```bash
# Connect to PostgreSQL
PGPASSWORD=your_password psql -h 100.100.20.1 -p 5432 -U postgres

# Create database
CREATE DATABASE reimbursement_db;

# Exit
\q
```

### Step 2: Start Backend API

Open a new terminal and run:

```bash
cd /home/nvn/Desktop/reimbursement-app/backend
export PATH=$PATH:/usr/local/go/bin
./start.sh
```

**Expected Output:**
```
Starting Reimbursement Backend API...
=======================================
✓ Environment variables loaded
✓ Go version: go version go1.21.5 linux/amd64
✓ Database connection successful

Starting server on 0.0.0.0:8080...
=======================================

Database connection established successfully
Migrations completed successfully
Created default user: karyawan
Created default user: manager
Created default user: finance
Server starting on 0.0.0.0:8080
```

**Verify backend is running:**
```bash
curl http://localhost:8080/api/health
# Should return: {"status":"ok"}
```

### Step 3: Start Frontend

Open another terminal and run:

```bash
cd /home/nvn/Desktop/reimbursement-app/frontend
npm run dev
```

**Expected Output:**
```
> my-v0-project@0.1.0 dev
> next dev

   ▲ Next.js 16.0.0 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://192.168.0.197:3000

 ✓ Ready in 2.5s
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the login page with three quick login buttons.

## Quick Test Workflow

### Test 1: Employee Flow

1. **Login as Employee**
   - Click "Login sebagai Employee" button
   - Or manually enter:
     - Username: `karyawan`
     - Password: `karyawan123`

2. **Create Reimbursement**
   - Click "Buat Pengajuan Baru"
   - Fill in the form:
     - Title: "Transportation to Client Meeting"
     - Description: "Taxi fare for meeting with ABC Corp"
     - Category: Transport
     - Amount: 50000
     - Receipt URL: "https://example.com/receipt.jpg"
   - Click Submit

3. **View Status**
   - Check the dashboard to see your pending reimbursement

### Test 2: Manager Approval

1. **Logout** (if logged in as employee)

2. **Login as Manager**
   - Click "Login sebagai Manager" button
   - Or manually enter:
     - Username: `manager`
     - Password: `manager123`

3. **Review Pending Reimbursements**
   - You should see the reimbursement created by employee
   - Click "Review" or "Approve"
   - Add notes: "Approved for business purpose"
   - Click Approve

### Test 3: Finance Final Approval

1. **Logout** (if logged in as manager)

2. **Login as Finance**
   - Click "Login sebagai Finance" button
   - Or manually enter:
     - Username: `finance`
     - Password: `finance123`

3. **Process Manager-Approved Reimbursements**
   - You should see the manager-approved reimbursement
   - Click "Review" or "Approve"
   - Add notes: "Payment processed"
   - Click Approve

4. **Verify Completion**
   - The reimbursement status should now be "approved_finance"

## API Testing with curl

### Test Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan","password":"karyawan123"}'
```

### Test Create Reimbursement
```bash
# First, get the token from login response above
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8080/api/reimbursements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Transportation Cost",
    "description": "Taxi to client meeting",
    "category": "transport",
    "amount": 50000,
    "receipt_url": "https://example.com/receipt.jpg"
  }'
```

### Test Get All Reimbursements
```bash
curl -X GET http://localhost:8080/api/reimbursements \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Issue: Backend won't start

**Error: "Failed to connect to database"**

Solution:
1. Check if PostgreSQL is running:
   ```bash
   PGPASSWORD=your_password psql -h 100.100.20.1 -p 5432 -U postgres -c '\l'
   ```

2. Verify credentials in `backend/.env`

3. Check if database exists:
   ```bash
   PGPASSWORD=your_password psql -h 100.100.20.1 -p 5432 -U postgres -c '\l' | grep reimbursement_db
   ```

**Error: "Port 8080 already in use"**

Solution:
1. Find and kill the process:
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. Or change the port in `backend/.env`:
   ```env
   SERVER_PORT=8081
   ```
   And update frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8081/api
   ```

### Issue: Frontend won't start

**Error: "Port 3000 already in use"**

Solution:
1. Kill the process:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

**Error: "Cannot connect to API"**

Solution:
1. Verify backend is running:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Check `.env.local` in frontend directory:
   ```bash
   cat frontend/.env.local
   ```
   Should contain:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

### Issue: Login fails

**Error: "Invalid credentials"**

Solution:
1. Check if default users were created in backend logs

2. Manually verify users in database:
   ```bash
   PGPASSWORD=your_password psql -h 100.100.20.1 -p 5432 -U postgres -d reimbursement_db -c 'SELECT username, role FROM users;'
   ```

3. If users don't exist, restart the backend (it will create them automatically)

## Stopping the Application

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

## Quick Restart

```bash
# Terminal 1 - Backend
cd /home/nvn/Desktop/reimbursement-app/backend
export PATH=$PATH:/usr/local/go/bin
./start.sh

# Terminal 2 - Frontend
cd /home/nvn/Desktop/reimbursement-app/frontend
npm run dev
```

## Production Deployment Notes

For production deployment:

1. **Backend**:
   - Build binary: `cd backend && make build`
   - Use environment-specific `.env` file
   - Set up reverse proxy (nginx/traefik)
   - Enable HTTPS
   - Change `JWT_SECRET` to a strong random value

2. **Frontend**:
   - Build: `cd frontend && npm run build`
   - Update `NEXT_PUBLIC_API_URL` to production API URL
   - Deploy to Vercel, Netlify, or your server

3. **Database**:
   - Enable SSL mode: `DB_SSLMODE=require`
   - Use strong passwords
   - Set up regular backups
   - Configure connection pooling

## Support

If you encounter any issues:

1. Check the logs in both terminals
2. Verify all prerequisites are met
3. Review the main README.md for detailed documentation
4. Check API_DOCUMENTATION.md for API details

## Success Indicators

✅ Backend running: `curl http://localhost:8080/api/health` returns `{"status":"ok"}`

✅ Frontend running: Browser shows login page at `http://localhost:3000`

✅ Database connected: Backend logs show "Database connection established successfully"

✅ Users created: Backend logs show "Created default user: karyawan/manager/finance"

✅ Login works: Can login with any of the three default accounts

✅ Full workflow: Can create → manager approve → finance approve reimbursement

---

**Happy Testing! 🎉**
