package models

import (
	"time"
)

type ReimbursementStatus string

const (
	StatusPending          ReimbursementStatus = "pending"
	StatusApprovedManager  ReimbursementStatus = "approved_manager"
	StatusRejectedManager  ReimbursementStatus = "rejected_manager"
	StatusApprovedFinance  ReimbursementStatus = "approved_finance"
	StatusRejectedFinance  ReimbursementStatus = "rejected_finance"
	StatusCompleted        ReimbursementStatus = "completed"
)

type ReimbursementCategory string

const (
	CategoryTransport     ReimbursementCategory = "transport"
	CategoryAccommodation ReimbursementCategory = "accommodation"
	CategoryMeals         ReimbursementCategory = "meals"
	CategoryOfficeSupply  ReimbursementCategory = "office_supply"
	CategoryOther         ReimbursementCategory = "other"
)

type Reimbursement struct {
	ID              int                   `json:"id" db:"id"`
	EmployeeID      int                   `json:"employee_id" db:"employee_id"`
	EmployeeName    string                `json:"employee_name" db:"employee_name"`
	Title           string                `json:"title" db:"title"`
	Description     string                `json:"description" db:"description"`
	Category        ReimbursementCategory `json:"category" db:"category"`
	Amount          float64               `json:"amount" db:"amount"`
	ReceiptURL      string                `json:"receipt_url" db:"receipt_url"`
	Status          ReimbursementStatus   `json:"status" db:"status"`
	SubmittedDate   time.Time             `json:"submitted_date" db:"submitted_date"`
	ManagerID       *int                  `json:"manager_id,omitempty" db:"manager_id"`
	ManagerNotes    *string               `json:"manager_notes,omitempty" db:"manager_notes"`
	ManagerApproved *time.Time            `json:"manager_approved,omitempty" db:"manager_approved"`
	FinanceID       *int                  `json:"finance_id,omitempty" db:"finance_id"`
	FinanceNotes    *string               `json:"finance_notes,omitempty" db:"finance_notes"`
	FinanceApproved *time.Time            `json:"finance_approved,omitempty" db:"finance_approved"`
	CreatedAt       time.Time             `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time             `json:"updated_at" db:"updated_at"`
}

type CreateReimbursementRequest struct {
	Title       string                `json:"title" binding:"required"`
	Description string                `json:"description" binding:"required"`
	Category    ReimbursementCategory `json:"category" binding:"required"`
	Amount      float64               `json:"amount" binding:"required,gt=0"`
	ReceiptURL  string                `json:"receipt_url" binding:"required"`
}

type UpdateReimbursementRequest struct {
	Title       string                `json:"title"`
	Description string                `json:"description"`
	Category    ReimbursementCategory `json:"category"`
	Amount      float64               `json:"amount" binding:"omitempty,gt=0"`
	ReceiptURL  string                `json:"receipt_url"`
}

type ApprovalRequest struct {
	Action string  `json:"action" binding:"required,oneof=approve reject"`
	Notes  *string `json:"notes"`
}

type ReimbursementStats struct {
	TotalSubmitted int     `json:"total_submitted"`
	TotalApproved  int     `json:"total_approved"`
	TotalRejected  int     `json:"total_rejected"`
	TotalPending   int     `json:"total_pending"`
	TotalAmount    float64 `json:"total_amount"`
}
