# 🧪 Quick Test Guide

## Prerequisites
- ✅ Backend running on http://localhost:8080
- ✅ Frontend running on http://localhost:3000
- ✅ Database created and connected

## Test Scenario: Complete Workflow

### Step 1: Login as Employee
1. Open http://localhost:3000
2. Enter credentials:
   - Username: `karyawan`
   - Password: `karyawan123`
3. Click "Masuk"
4. ✅ Should redirect to `/employee` dashboard
5. ✅ Should see "Belum ada klaim" (no reimbursements yet)
6. ✅ Stats should show all zeros

### Step 2: Create Reimbursement
1. Click "Klaim Baru" button
2. Fill the form:
   ```
   Judul: Transportasi Meeting Klien
   Kategori: Perjalanan
   Jumlah: 150000
   Deskripsi: Taksi PP ke kantor klien ABC untuk presentasi proposal
   URL Kwitansi: https://example.com/receipt001.jpg
   ```
3. Click "Ajukan Klaim"
4. ✅ Should see success toast "Reimbursement berhasil diajukan"
5. ✅ Dialog should close
6. ✅ Table should show new reimbursement with status "Tertunda"
7. ✅ Stats should update:
   - Total Klaim: 1
   - Tertunda: 1
   - Total Jumlah: Rp 150.000

### Step 3: Create More Reimbursements
Create 2 more reimbursements:

**Reimbursement 2:**
```
Judul: Makan Siang Tim
Kategori: Makanan
Jumlah: 250000
Deskripsi: Makan siang bersama tim untuk diskusi project
URL Kwitansi: https://example.com/receipt002.jpg
```

**Reimbursement 3:**
```
Judul: Pembelian Alat Tulis
Kategori: Perlengkapan Kantor
Jumlah: 85000
Deskripsi: Spidol, kertas, dan sticky notes untuk meeting room
URL Kwitansi: https://example.com/receipt003.jpg
```

✅ Stats should now show:
- Total Klaim: 3
- Tertunda: 3
- Total Jumlah: Rp 485.000

### Step 4: Logout
1. Click logout icon (top right)
2. ✅ Should redirect to login page
3. ✅ Token cleared from localStorage

### Step 5: Login as Manager
1. Enter credentials:
   - Username: `manager`
   - Password: `manager123`
2. Click "Masuk"
3. ✅ Should redirect to `/manager` dashboard
4. ✅ Should see 3 pending reimbursements

### Step 6: Manager Approval (If manager dashboard is integrated)
1. Review first reimbursement
2. Click "Approve"
3. Add notes: "Approved for business purpose"
4. Submit
5. ✅ Status should change to "Disetujui Manager"

### Step 7: Login as Finance
1. Logout from manager
2. Login with:
   - Username: `finance`
   - Password: `finance123`
3. ✅ Should redirect to `/finance` dashboard
4. ✅ Should see manager-approved reimbursements

### Step 8: Finance Approval (If finance dashboard is integrated)
1. Review manager-approved reimbursement
2. Click "Approve"
3. Add notes: "Payment processed"
4. Submit
5. ✅ Status should change to "Disetujui Finance"

### Step 9: Verify as Employee
1. Logout from finance
2. Login as employee again
3. ✅ Should see updated statuses in table
4. ✅ Stats should reflect approvals

## API Testing with curl

### Test 1: Health Check
```bash
curl http://localhost:8080/api/health
```
Expected: `{"status":"ok"}`

### Test 2: Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan","password":"karyawan123"}'
```
Expected: JSON with token and user data

### Test 3: Get Reimbursements (with token)
```bash
TOKEN="your_token_here"
curl -X GET http://localhost:8080/api/reimbursements \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Array of reimbursements

### Test 4: Create Reimbursement
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:8080/api/reimbursements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Reimbursement",
    "description": "Testing API",
    "category": "transport",
    "amount": 100000,
    "receipt_url": "https://example.com/receipt.jpg"
  }'
```
Expected: Created reimbursement object

## Browser DevTools Check

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Login as employee
4. ✅ Should see POST to `/api/login`
5. ✅ Response should have 200 status
6. ✅ Response should contain token

### Application Tab (localStorage)
1. Go to Application tab
2. Expand localStorage
3. ✅ Should see `auth_token` key
4. ✅ Should see `user` key with JSON data

### Console Tab
1. Check for errors
2. ✅ Should have no errors
3. ✅ No CORS errors
4. ✅ No 401/403 errors

## Common Issues & Solutions

### Issue: "Failed to fetch"
- ✅ Check backend is running: `curl http://localhost:8080/api/health`
- ✅ Check `.env.local` has correct API URL
- ✅ Restart frontend: `npm run dev`

### Issue: "Invalid credentials"
- ✅ Check username/password are correct
- ✅ Check backend logs for errors
- ✅ Verify users exist in database

### Issue: "Unauthorized"
- ✅ Check token exists in localStorage
- ✅ Token might be expired (24 hours)
- ✅ Login again to get new token

### Issue: Empty data
- ✅ Check backend is connected to database
- ✅ Check API response in Network tab
- ✅ Check console for JavaScript errors

## Success Checklist

- [ ] Can login as employee
- [ ] Can see dashboard
- [ ] Can create reimbursement
- [ ] Stats update correctly
- [ ] Table shows data
- [ ] Can logout
- [ ] Can login as different roles
- [ ] No console errors
- [ ] No network errors
- [ ] Data persists after refresh

## Performance Check

- ✅ Login should take < 1 second
- ✅ Dashboard load should take < 2 seconds
- ✅ Create reimbursement should take < 1 second
- ✅ No unnecessary API calls
- ✅ Smooth UI transitions

---

**If all tests pass, your integration is working perfectly!** 🎉
