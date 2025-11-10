package repository

import (
	"database/sql"
	"fmt"
	"time"

	"reimbursement-backend/internal/models"
)

type ReimbursementRepository struct {
	db *sql.DB
}

func NewReimbursementRepository(db *sql.DB) *ReimbursementRepository {
	return &ReimbursementRepository{db: db}
}

func (r *ReimbursementRepository) Create(reimb *models.Reimbursement) error {
	query := `
		INSERT INTO reimbursements (employee_id, employee_name, title, description, category, amount, receipt_url, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, submitted_date, created_at, updated_at
	`
	return r.db.QueryRow(
		query,
		reimb.EmployeeID,
		reimb.EmployeeName,
		reimb.Title,
		reimb.Description,
		reimb.Category,
		reimb.Amount,
		reimb.ReceiptURL,
		reimb.Status,
	).Scan(&reimb.ID, &reimb.SubmittedDate, &reimb.CreatedAt, &reimb.UpdatedAt)
}

func (r *ReimbursementRepository) GetByID(id int) (*models.Reimbursement, error) {
	reimb := &models.Reimbursement{}
	query := `
		SELECT id, employee_id, employee_name, title, description, category, amount, receipt_url, 
		       status, submitted_date, manager_id, manager_notes, manager_approved, 
		       finance_id, finance_notes, finance_approved, created_at, updated_at
		FROM reimbursements
		WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&reimb.ID,
		&reimb.EmployeeID,
		&reimb.EmployeeName,
		&reimb.Title,
		&reimb.Description,
		&reimb.Category,
		&reimb.Amount,
		&reimb.ReceiptURL,
		&reimb.Status,
		&reimb.SubmittedDate,
		&reimb.ManagerID,
		&reimb.ManagerNotes,
		&reimb.ManagerApproved,
		&reimb.FinanceID,
		&reimb.FinanceNotes,
		&reimb.FinanceApproved,
		&reimb.CreatedAt,
		&reimb.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("reimbursement not found")
		}
		return nil, err
	}
	return reimb, nil
}

func (r *ReimbursementRepository) GetAll() ([]models.Reimbursement, error) {
	query := `
		SELECT id, employee_id, employee_name, title, description, category, amount, receipt_url, 
		       status, submitted_date, manager_id, manager_notes, manager_approved, 
		       finance_id, finance_notes, finance_approved, created_at, updated_at
		FROM reimbursements
		ORDER BY submitted_date DESC
	`
	return r.queryReimbursements(query)
}

func (r *ReimbursementRepository) GetByEmployeeID(employeeID int) ([]models.Reimbursement, error) {
	query := `
		SELECT id, employee_id, employee_name, title, description, category, amount, receipt_url, 
		       status, submitted_date, manager_id, manager_notes, manager_approved, 
		       finance_id, finance_notes, finance_approved, created_at, updated_at
		FROM reimbursements
		WHERE employee_id = $1
		ORDER BY submitted_date DESC
	`
	return r.queryReimbursements(query, employeeID)
}

func (r *ReimbursementRepository) GetByStatus(status models.ReimbursementStatus) ([]models.Reimbursement, error) {
	query := `
		SELECT id, employee_id, employee_name, title, description, category, amount, receipt_url, 
		       status, submitted_date, manager_id, manager_notes, manager_approved, 
		       finance_id, finance_notes, finance_approved, created_at, updated_at
		FROM reimbursements
		WHERE status = $1
		ORDER BY submitted_date DESC
	`
	return r.queryReimbursements(query, status)
}

func (r *ReimbursementRepository) Update(reimb *models.Reimbursement) error {
	query := `
		UPDATE reimbursements
		SET title = $1, description = $2, category = $3, amount = $4, receipt_url = $5
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRow(
		query,
		reimb.Title,
		reimb.Description,
		reimb.Category,
		reimb.Amount,
		reimb.ReceiptURL,
		reimb.ID,
	).Scan(&reimb.UpdatedAt)
}

func (r *ReimbursementRepository) UpdateStatus(id int, status models.ReimbursementStatus) error {
	query := `UPDATE reimbursements SET status = $1 WHERE id = $2`
	_, err := r.db.Exec(query, status, id)
	return err
}

func (r *ReimbursementRepository) ApproveByManager(id, managerID int, notes *string) error {
	query := `
		UPDATE reimbursements
		SET status = $1, manager_id = $2, manager_notes = $3, manager_approved = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(query, models.StatusApprovedManager, managerID, notes, time.Now(), id)
	return err
}

func (r *ReimbursementRepository) RejectByManager(id, managerID int, notes *string) error {
	query := `
		UPDATE reimbursements
		SET status = $1, manager_id = $2, manager_notes = $3, manager_approved = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(query, models.StatusRejectedManager, managerID, notes, time.Now(), id)
	return err
}

func (r *ReimbursementRepository) ApproveByFinance(id, financeID int, notes *string) error {
	query := `
		UPDATE reimbursements
		SET status = $1, finance_id = $2, finance_notes = $3, finance_approved = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(query, models.StatusApprovedFinance, financeID, notes, time.Now(), id)
	return err
}

func (r *ReimbursementRepository) RejectByFinance(id, financeID int, notes *string) error {
	query := `
		UPDATE reimbursements
		SET status = $1, finance_id = $2, finance_notes = $3, finance_approved = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(query, models.StatusRejectedFinance, financeID, notes, time.Now(), id)
	return err
}

func (r *ReimbursementRepository) Delete(id int) error {
	query := `DELETE FROM reimbursements WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *ReimbursementRepository) GetStats(employeeID *int) (*models.ReimbursementStats, error) {
	stats := &models.ReimbursementStats{}
	
	var query string
	var args []interface{}
	
	if employeeID != nil {
		query = `
			SELECT 
				COUNT(*) as total_submitted,
				COUNT(CASE WHEN status IN ('approved_manager', 'approved_finance', 'completed') THEN 1 END) as total_approved,
				COUNT(CASE WHEN status IN ('rejected_manager', 'rejected_finance') THEN 1 END) as total_rejected,
				COUNT(CASE WHEN status = 'pending' THEN 1 END) as total_pending,
				COALESCE(SUM(amount), 0) as total_amount
			FROM reimbursements
			WHERE employee_id = $1
		`
		args = append(args, *employeeID)
	} else {
		query = `
			SELECT 
				COUNT(*) as total_submitted,
				COUNT(CASE WHEN status IN ('approved_manager', 'approved_finance', 'completed') THEN 1 END) as total_approved,
				COUNT(CASE WHEN status IN ('rejected_manager', 'rejected_finance') THEN 1 END) as total_rejected,
				COUNT(CASE WHEN status = 'pending' THEN 1 END) as total_pending,
				COALESCE(SUM(amount), 0) as total_amount
			FROM reimbursements
		`
	}
	
	err := r.db.QueryRow(query, args...).Scan(
		&stats.TotalSubmitted,
		&stats.TotalApproved,
		&stats.TotalRejected,
		&stats.TotalPending,
		&stats.TotalAmount,
	)
	return stats, err
}

func (r *ReimbursementRepository) queryReimbursements(query string, args ...interface{}) ([]models.Reimbursement, error) {
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reimbursements []models.Reimbursement
	for rows.Next() {
		var reimb models.Reimbursement
		err := rows.Scan(
			&reimb.ID,
			&reimb.EmployeeID,
			&reimb.EmployeeName,
			&reimb.Title,
			&reimb.Description,
			&reimb.Category,
			&reimb.Amount,
			&reimb.ReceiptURL,
			&reimb.Status,
			&reimb.SubmittedDate,
			&reimb.ManagerID,
			&reimb.ManagerNotes,
			&reimb.ManagerApproved,
			&reimb.FinanceID,
			&reimb.FinanceNotes,
			&reimb.FinanceApproved,
			&reimb.CreatedAt,
			&reimb.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		reimbursements = append(reimbursements, reimb)
	}
	return reimbursements, nil
}
