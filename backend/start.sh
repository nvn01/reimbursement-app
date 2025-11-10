#!/bin/bash

echo "Starting Reimbursement Backend API..."
echo "======================================="

# Add Go to PATH
export PATH=$PATH:/usr/local/go/bin

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Environment variables loaded"
else
    echo "⚠ Warning: .env file not found, using defaults"
fi

# Check Go installation
if ! command -v go &> /dev/null; then
    echo "✗ Go is not installed or not in PATH"
    exit 1
fi

echo "✓ Go version: $(go version)"

# Check database connectivity
echo ""
echo "Checking database connection..."
if command -v psql &> /dev/null; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Database connection successful"
    else
        echo "⚠ Warning: Could not connect to database at $DB_HOST:$DB_PORT"
        echo "  Make sure PostgreSQL is running and credentials are correct"
    fi
else
    echo "⚠ psql not installed, skipping database check"
fi

echo ""
echo "Starting server on $SERVER_HOST:$SERVER_PORT..."
echo "======================================="
echo ""

# Run the application
go run cmd/api/main.go
