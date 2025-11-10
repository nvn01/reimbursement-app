# Database Scripts

## Seed 50 Employee Users

This script creates 50 employee users in the database.

### Automatic Seeding (Recommended)

The backend automatically seeds users on startup. Just run:

```bash
cd backend
./start.sh
```

This will create:
- `karyawan` (original employee)
- `karyawan1` to `karyawan50` (50 new employees)
- `manager` (manager user)
- `finance` (finance user)

All with the same password: `karyawan123` for employees, `manager123` for manager, `finance123` for finance.

### Manual Seeding

If you need to seed users manually:

```bash
cd backend/scripts
./run_seed_employees.sh
```

Or run the Go script directly:

```bash
cd backend/scripts
go run seed_50_employees.go
```

## User Credentials

After seeding, you can login with:

### Employees (53 total)
- `karyawan` / `karyawan123` (original)
- `karyawan1` / `karyawan123`
- `karyawan2` / `karyawan123`
- ...
- `karyawan50` / `karyawan123`

### Manager
- `manager` / `manager123`

### Finance
- `finance` / `finance123`

## Notes

- All scripts use environment variables from `.env` file
- Users are only created if they don't already exist
- Passwords are hashed using bcrypt
- Each employee has a unique email: `karyawan1@company.com`, `karyawan2@company.com`, etc.

## Security Warning

⚠️ **These scripts contain database credentials and should NOT be committed to Git!**

They are already in `.gitignore`. For production, use proper secrets management.
