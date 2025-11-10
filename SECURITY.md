# Security Guidelines

## Environment Variables

### Backend (.env)
Copy `.env.example` to `.env` and update with your actual credentials:
```bash
cd backend
cp .env.example .env
```

**Important:** Never commit `.env` files to Git!

Required variables:
- `DB_HOST` - Database host
- `DB_PORT` - Database port  
- `DB_USER` - Database username
- `DB_PASSWORD` - **Your actual database password**
- `DB_NAME` - Database name
- `JWT_SECRET` - **Generate a strong secret key**

### Frontend (.env.local)
Copy `.env.example` to `.env.local`:
```bash
cd frontend
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `http://localhost:8080/api`)
- `NEXT_PUBLIC_BACKEND_URL` - Backend base URL (e.g., `http://localhost:8080`)

## What's Gitignored

### Backend
- `.env` - Contains sensitive credentials
- `uploads/` - User uploaded files
- `scripts/*.go` - Scripts with hardcoded credentials (for local dev only)

### Frontend
- `.env.local` - Local environment configuration
- `.env*.local` - All local environment files
- `node_modules/` - Dependencies
- `.next/` - Build output

## Production Deployment

### Never commit:
- ❌ Database passwords
- ❌ JWT secrets
- ❌ API keys
- ❌ User uploaded files
- ❌ `.env` or `.env.local` files

### Always use:
- ✅ Environment variables
- ✅ `.env.example` files (with placeholder values)
- ✅ Secrets management (e.g., GitHub Secrets, AWS Secrets Manager)
- ✅ Strong, randomly generated passwords and secrets

## Generating Secure Secrets

### JWT Secret
```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

### Database Password
Use a strong password generator or:
```bash
openssl rand -base64 24
```

## Default Credentials (Development Only)

The application seeds default users for development:
- Employee: `karyawan` / `karyawan123`
- Manager: `manager` / `manager123`
- Finance: `finance` / `finance123`

**⚠️ Change these passwords in production!**

## File Upload Security

- Maximum file size: 10MB
- Allowed file types: JPG, JPEG, PNG, GIF, WEBP, PDF
- Files are stored in `./uploads` directory
- Files are served statically from `/uploads` endpoint

**Production recommendation:** Use cloud storage (S3, Google Cloud Storage) instead of local file storage.
