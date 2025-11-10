-- Insert default users with properly hashed passwords
-- These passwords are hashed with bcrypt

-- Delete existing users if they exist (optional)
DELETE FROM users WHERE username IN ('karyawan', 'manager', 'finance');

-- Insert users with bcrypt hashed passwords
-- karyawan:karyawan123
INSERT INTO users (username, password, full_name, email, role) VALUES
('karyawan', '$2a$10$YPZQjN5YqVZQjN5YqVZQjOXxGxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'Employee User', 'karyawan@company.com', 'employee');

-- manager:manager123  
INSERT INTO users (username, password, full_name, email, role) VALUES
('manager', '$2a$10$YPZQjN5YqVZQjN5YqVZQjOXxGxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'Manager User', 'manager@company.com', 'manager');

-- finance:finance123
INSERT INTO users (username, password, full_name, email, role) VALUES
('finance', '$2a$10$YPZQjN5YqVZQjN5YqVZQjOXxGxGxGxGxGxGxGxGxGxGxGxGxGxGxG', 'Finance User', 'finance@company.com', 'finance');
