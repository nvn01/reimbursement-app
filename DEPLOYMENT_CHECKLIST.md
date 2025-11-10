# Deployment Checklist

## Before Pushing to GitHub

### ✅ Security Check
- [x] `.env` files are in `.gitignore`
- [x] `.env.local` files are in `.gitignore`
- [x] Scripts with hardcoded credentials are gitignored
- [x] `uploads/` directory is gitignored
- [x] `.env.example` files are created with placeholder values
- [x] No hardcoded URLs in source code (using environment variables)
- [x] `SECURITY.md` file created

### ✅ Configuration Files
- [x] Backend `.env.example` exists with all required variables
- [x] Frontend `.env.example` exists with all required variables
- [x] Root `.gitignore` exists
- [x] Backend `.gitignore` updated
- [x] Frontend `.gitignore` updated

### ✅ Code Quality
- [x] No hardcoded `localhost:8080` in components (using `getFileUrl` helper)
- [x] All sensitive data moved to environment variables
- [x] API base URL configurable via `NEXT_PUBLIC_API_URL`
- [x] Backend URL configurable via `NEXT_PUBLIC_BACKEND_URL`

## Git Commands to Push

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit with descriptive message
git commit -m "feat: Add file upload, history, and payment receipt features

- Implement file upload for receipts (images and PDF)
- Add history/riwayat tabs for manager and finance
- Add payment receipt generation and printing
- Fix security: move hardcoded URLs to environment variables
- Add .env.example files for both frontend and backend
- Update .gitignore to exclude sensitive files
- Add SECURITY.md documentation"

# 4. Push to GitHub
git push origin main
```

## After Pushing

### For Other Developers
When cloning the repository, they need to:

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with actual credentials
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with actual API URLs
   ```

3. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   go mod download
   
   # Frontend
   cd frontend
   npm install
   ```

4. **Run Migrations:**
   ```bash
   cd backend
   # Database will auto-migrate on startup
   ./start.sh
   ```

## Production Deployment

### Environment Variables to Set

**Backend:**
- `SERVER_HOST=0.0.0.0`
- `SERVER_PORT=8080`
- `DB_HOST=<your-db-host>`
- `DB_PORT=5432`
- `DB_USER=<your-db-user>`
- `DB_PASSWORD=<strong-password>`
- `DB_NAME=reimbursement_db`
- `DB_SSLMODE=require` (for production)
- `JWT_SECRET=<generate-strong-secret>`
- `JWT_EXPIRE_HOUR=24`

**Frontend:**
- `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`
- `NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com`

### Security Recommendations

1. **Change default user passwords** immediately after first deployment
2. **Use HTTPS** in production
3. **Enable database SSL** (`DB_SSLMODE=require`)
4. **Use cloud storage** for file uploads (S3, Google Cloud Storage)
5. **Set up CORS** properly for your frontend domain
6. **Enable rate limiting** on API endpoints
7. **Regular security audits** and dependency updates

## Verification

After deployment, verify:
- [ ] Can login with test credentials
- [ ] Can create reimbursement with file upload
- [ ] Manager can approve/reject claims
- [ ] Finance can approve/reject and print receipts
- [ ] Employees can view payment receipts
- [ ] All uploaded files are accessible
- [ ] No sensitive data exposed in browser console
- [ ] HTTPS working (production)
