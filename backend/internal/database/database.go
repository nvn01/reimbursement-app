package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"reimbursement-backend/config"
)

type Database struct {
	DB *sql.DB
}

func New(cfg *config.Config) (*Database, error) {
	connStr := cfg.Database.ConnectionString()
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	log.Println("Database connection established successfully")

	return &Database{DB: db}, nil
}

func (d *Database) Close() error {
	return d.DB.Close()
}

func (d *Database) RunMigrations() error {
	// This is a simple migration runner
	// In production, consider using a proper migration tool like golang-migrate
	
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			full_name VARCHAR(100) NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'finance')),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		
		`CREATE TABLE IF NOT EXISTS reimbursements (
			id SERIAL PRIMARY KEY,
			employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			employee_name VARCHAR(100) NOT NULL,
			name VARCHAR(200),
			title VARCHAR(200) NOT NULL,
			description TEXT NOT NULL,
			category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'meals', 'office_supply', 'other')),
			amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
			receipt_url TEXT NOT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved_manager', 'rejected_manager', 'approved_finance', 'rejected_finance', 'completed')),
			submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			manager_notes TEXT,
			manager_approved TIMESTAMP,
			finance_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
			finance_notes TEXT,
			finance_approved TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		
		`ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS name VARCHAR(200)`,
		
		`CREATE INDEX IF NOT EXISTS idx_reimbursements_employee_id ON reimbursements(employee_id)`,
		`CREATE INDEX IF NOT EXISTS idx_reimbursements_status ON reimbursements(status)`,
		`CREATE INDEX IF NOT EXISTS idx_reimbursements_submitted_date ON reimbursements(submitted_date)`,
		`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
		`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
		
		`CREATE OR REPLACE FUNCTION update_updated_at_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = CURRENT_TIMESTAMP;
			RETURN NEW;
		END;
		$$ language 'plpgsql'`,
		
		`DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
		`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
			FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
		
		`DROP TRIGGER IF EXISTS update_reimbursements_updated_at ON reimbursements`,
		`CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON reimbursements
			FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
	}

	for _, migration := range migrations {
		if _, err := d.DB.Exec(migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	log.Println("Migrations completed successfully")
	return nil
}
