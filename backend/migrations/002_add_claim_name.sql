-- Add name column to reimbursements table
ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS name VARCHAR(200);

-- Update existing records to have a default name
UPDATE reimbursements SET name = employee_name WHERE name IS NULL;
