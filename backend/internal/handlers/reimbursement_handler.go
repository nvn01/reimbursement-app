package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"reimbursement-backend/internal/models"
	"reimbursement-backend/internal/repository"
)

type ReimbursementHandler struct {
	reimbRepo *repository.ReimbursementRepository
	userRepo  *repository.UserRepository
}

func NewReimbursementHandler(reimbRepo *repository.ReimbursementRepository, userRepo *repository.UserRepository) *ReimbursementHandler {
	return &ReimbursementHandler{
		reimbRepo: reimbRepo,
		userRepo:  userRepo,
	}
}

func (h *ReimbursementHandler) Create(c *gin.Context) {
	var req models.CreateReimbursementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	user, err := h.userRepo.GetByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}

	reimb := &models.Reimbursement{
		EmployeeID:   user.ID,
		EmployeeName: req.Name, // Use the name from form input
		Name:         req.Name,
		Title:        req.Title,
		Description:  req.Description,
		Category:     req.Category,
		Amount:       req.Amount,
		ReceiptURL:   req.ReceiptURL,
		Status:       models.StatusPending,
	}

	if err := h.reimbRepo.Create(reimb); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reimbursement"})
		return
	}

	c.JSON(http.StatusCreated, reimb)
}

func (h *ReimbursementHandler) GetAll(c *gin.Context) {
	userRole, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var reimbursements []models.Reimbursement
	var err error

	// Employees can only see their own reimbursements
	if userRole == models.RoleEmployee {
		reimbursements, err = h.reimbRepo.GetByEmployeeID(userID.(int))
	} else {
		// Managers and Finance can see all reimbursements
		reimbursements, err = h.reimbRepo.GetAll()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reimbursements"})
		return
	}

	c.JSON(http.StatusOK, reimbursements)
}

func (h *ReimbursementHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reimb, err := h.reimbRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	// Check if employee is accessing their own reimbursement
	userRole, _ := c.Get("role")
	userID, _ := c.Get("user_id")
	if userRole == models.RoleEmployee && reimb.EmployeeID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, reimb)
}

func (h *ReimbursementHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reimb, err := h.reimbRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	// Only the employee who created it can update, and only if status is pending
	userID, _ := c.Get("user_id")
	if reimb.EmployeeID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if reimb.Status != models.StatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update reimbursement that is not pending"})
		return
	}

	var req models.UpdateReimbursementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if req.Name != "" {
		reimb.Name = req.Name
	}
	if req.Title != "" {
		reimb.Title = req.Title
	}
	if req.Description != "" {
		reimb.Description = req.Description
	}
	if req.Category != "" {
		reimb.Category = req.Category
	}
	if req.Amount > 0 {
		reimb.Amount = req.Amount
	}
	if req.ReceiptURL != "" {
		reimb.ReceiptURL = req.ReceiptURL
	}

	if err := h.reimbRepo.Update(reimb); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reimbursement"})
		return
	}

	c.JSON(http.StatusOK, reimb)
}

func (h *ReimbursementHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reimb, err := h.reimbRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	// Only the employee who created it can delete, and only if status is pending
	userID, _ := c.Get("user_id")
	if reimb.EmployeeID != userID.(int) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if reimb.Status != models.StatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete reimbursement that is not pending"})
		return
	}

	if err := h.reimbRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete reimbursement"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reimbursement deleted successfully"})
}

func (h *ReimbursementHandler) ManagerApproval(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reimb, err := h.reimbRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	if reimb.Status != models.StatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reimbursement is not pending"})
		return
	}

	var req models.ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	managerID, _ := c.Get("user_id")

	if req.Action == "approve" {
		err = h.reimbRepo.ApproveByManager(id, managerID.(int), req.Notes)
	} else {
		err = h.reimbRepo.RejectByManager(id, managerID.(int), req.Notes)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process approval"})
		return
	}

	// Fetch updated reimbursement
	reimb, _ = h.reimbRepo.GetByID(id)
	c.JSON(http.StatusOK, reimb)
}

func (h *ReimbursementHandler) FinanceApproval(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reimb, err := h.reimbRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	if reimb.Status != models.StatusApprovedManager {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reimbursement must be approved by manager first"})
		return
	}

	var req models.ApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	financeID, _ := c.Get("user_id")

	if req.Action == "approve" {
		err = h.reimbRepo.ApproveByFinance(id, financeID.(int), req.Notes)
	} else {
		err = h.reimbRepo.RejectByFinance(id, financeID.(int), req.Notes)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process approval"})
		return
	}

	// Fetch updated reimbursement
	reimb, _ = h.reimbRepo.GetByID(id)
	c.JSON(http.StatusOK, reimb)
}

func (h *ReimbursementHandler) GetStats(c *gin.Context) {
	userRole, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var stats *models.ReimbursementStats
	var err error

	// Employees get their own stats, others get overall stats
	if userRole == models.RoleEmployee {
		employeeID := userID.(int)
		stats, err = h.reimbRepo.GetStats(&employeeID)
	} else {
		stats, err = h.reimbRepo.GetStats(nil)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *ReimbursementHandler) GetPendingForManager(c *gin.Context) {
	reimbursements, err := h.reimbRepo.GetByStatus(models.StatusPending)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending reimbursements"})
		return
	}

	c.JSON(http.StatusOK, reimbursements)
}

func (h *ReimbursementHandler) GetPendingForFinance(c *gin.Context) {
	reimbursements, err := h.reimbRepo.GetByStatus(models.StatusApprovedManager)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending reimbursements"})
		return
	}

	c.JSON(http.StatusOK, reimbursements)
}
