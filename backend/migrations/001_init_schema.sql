-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'finance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reimbursements table
CREATE TABLE IF NOT EXISTS reimbursements (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_name VARCHAR(100) NOT NULL,
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
);

-- Create indexes for better query performance
CREATE INDEX idx_reimbursements_employee_id ON reimbursements(employee_id);
CREATE INDEX idx_reimbursements_status ON reimbursements(status);
CREATE INDEX idx_reimbursements_submitted_date ON reimbursements(submitted_date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Insert default users (passwords are hashed with bcrypt)
-- karyawan:karyawan123, manager:manager123, finance:finance123
INSERT INTO users (username, password, full_name, email, role) VALUES
('karyawan', '$2a$10$YourHashedPasswordHere1', 'Employee User', 'karyawan@company.com', 'employee'),
('manager', '$2a$10$YourHashedPasswordHere2', 'Manager User', 'manager@company.com', 'manager'),
('finance', '$2a$10$YourHashedPasswordHere3', 'Finance User', 'finance@company.com', 'finance')
ON CONFLICT (username) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON reimbursements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
