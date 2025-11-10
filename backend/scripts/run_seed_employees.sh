#!/bin/bash

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

echo "Seeding 50 employee users..."
echo "=============================="

cd "$(dirname "$0")"
go run seed_50_employees.go

echo ""
echo "Done! You can now login with:"
echo "  karyawan1 / karyawan123"
echo "  karyawan2 / karyawan123"
echo "  ..."
echo "  karyawan50 / karyawan123"
