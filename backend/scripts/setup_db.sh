#!/bin/bash

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-100.100.20.1}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-reimbursement_db}

echo "Setting up database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if database exists, create if not
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "Database setup complete!"
echo "You can now run the application with: go run cmd/api/main.go"
