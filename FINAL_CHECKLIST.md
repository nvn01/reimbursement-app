# ✅ Final Setup Checklist

## Before You Start

### 1. Update Database Password
```bash
cd /home/nvn/Desktop/reimbursement-app/backend
nano .env
```

**Change this line:**
```env
DB_PASSWORD=
```

**To your actual PostgreSQL password:**
```env
DB_PASSWORD=your_actual_postgres_password
```

Save and exit (Ctrl+X, then Y, then Enter)

### 2. Verify PostgreSQL is Running
```bash
PGPASSWORD=your_password psql -h 100.100.20.1 -p 5432 -U postgres -c '\l'
```

If this works, you're good to go!

## Start the Application

### Terminal 1: Start Backend
```bash
cd /home/nvn/Desktop/reimbursement-app/backend
export PATH=$PATH:/usr/local/go/bin
./start.sh
```

**Wait for this message:**
```
Server starting on 0.0.0.0:8080
```

### Terminal 2: Start Frontend (Already Running)
The frontend is already running on port 3000 from earlier.

If you need to restart it:
```bash
cd /home/nvn/Desktop/reimbursement-app/frontend
npm run dev
```

## Test the Application

### Step 1: Open Browser
Navigate to: **http://localhost:3000**

### Step 2: Quick Login Test
Click one of these buttons:
- ✅ **Login sebagai Employee** (karyawan/karyawan123)
- ✅ **Login sebagai Manager** (manager/manager123)
- ✅ **Login sebagai Finance** (finance/finance123)

### Step 3: Test Full Workflow

1. **As Employee (karyawan/karyawan123)**
   - Create a new reimbursement
   - Fill in all fields
   - Submit

2. **As Manager (manager/manager123)**
   - View pending reimbursements
   - Approve the one you just created
   - Add notes

3. **As Finance (finance/finance123)**
   - View manager-approved reimbursements
   - Give final approval
   - Add notes

## Verification Checklist

- [ ] Backend started without errors
- [ ] Frontend is accessible at http://localhost:3000
- [ ] Can login as employee
- [ ] Can login as manager
- [ ] Can login as finance
- [ ] Can create reimbursement as employee
- [ ] Can approve as manager
- [ ] Can approve as finance
- [ ] Dashboard shows correct statistics

## Quick Commands Reference

### Check Backend Health
```bash
curl http://localhost:8080/api/health
```
Should return: `{"status":"ok"}`

### Test Login via API
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan","password":"karyawan123"}'
```

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

## Troubleshooting

### Backend won't start?
1. Check database password in `.env`
2. Verify PostgreSQL is accessible
3. Check if port 8080 is free: `lsof -ti:8080`

### Frontend can't connect?
1. Verify backend is running: `curl http://localhost:8080/api/health`
2. Check `.env.local` exists in frontend folder
3. Restart frontend: `npm run dev`

### Login fails?
1. Check backend logs for errors
2. Verify users were created (check backend startup logs)
3. Try the quick login buttons instead of manual entry

## Need Help?

Read these files in order:
1. `STARTUP_GUIDE.md` - Detailed startup instructions
2. `README.md` - Complete project documentation
3. `backend/API_DOCUMENTATION.md` - API reference
4. `PROJECT_SUMMARY.md` - What was built

## Success! 🎉

If you can:
- ✅ Login with any account
- ✅ See the dashboard
- ✅ Create a reimbursement
- ✅ Approve it through the workflow

**Then everything is working perfectly!**

---

**Your application is ready to use!**

Access it at: **http://localhost:3000**
