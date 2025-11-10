package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"reimbursement-backend/config"
	"reimbursement-backend/internal/database"
	"reimbursement-backend/internal/handlers"
	"reimbursement-backend/internal/middleware"
	"reimbursement-backend/internal/models"
	"reimbursement-backend/internal/repository"
	"reimbursement-backend/pkg/utils"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.New(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations
	if err := db.RunMigrations(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed default users if they don't exist
	seedDefaultUsers(db, repository.NewUserRepository(db.DB))

	// Initialize repositories
	userRepo := repository.NewUserRepository(db.DB)
	reimbRepo := repository.NewReimbursementRepository(db.DB)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, cfg)
	reimbHandler := handlers.NewReimbursementHandler(reimbRepo, userRepo)

	// Setup router
	router := setupRouter(cfg, authHandler, reimbHandler)

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(cfg *config.Config, authHandler *handlers.AuthHandler, reimbHandler *handlers.ReimbursementHandler) *gin.Engine {
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Public routes
	public := router.Group("/api")
	{
		public.POST("/login", authHandler.Login)
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})
	}

	// Protected routes
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// Profile
		protected.GET("/profile", authHandler.GetProfile)

		// Reimbursements - All authenticated users
		protected.GET("/reimbursements", reimbHandler.GetAll)
		protected.GET("/reimbursements/:id", reimbHandler.GetByID)
		protected.GET("/reimbursements/stats", reimbHandler.GetStats)

		// Reimbursements - Employee only
		employee := protected.Group("")
		employee.Use(middleware.RequireRole(models.RoleEmployee))
		{
			employee.POST("/reimbursements", reimbHandler.Create)
			employee.PUT("/reimbursements/:id", reimbHandler.Update)
			employee.DELETE("/reimbursements/:id", reimbHandler.Delete)
		}

		// Reimbursements - Manager only
		manager := protected.Group("")
		manager.Use(middleware.RequireRole(models.RoleManager))
		{
			manager.GET("/manager/pending", reimbHandler.GetPendingForManager)
			manager.POST("/manager/reimbursements/:id/approve", reimbHandler.ManagerApproval)
		}

		// Reimbursements - Finance only
		finance := protected.Group("")
		finance.Use(middleware.RequireRole(models.RoleFinance))
		{
			finance.GET("/finance/pending", reimbHandler.GetPendingForFinance)
			finance.POST("/finance/reimbursements/:id/approve", reimbHandler.FinanceApproval)
		}

		// Admin routes - Manager and Finance
		admin := protected.Group("")
		admin.Use(middleware.RequireRole(models.RoleManager, models.RoleFinance))
		{
			admin.GET("/users", authHandler.GetAllUsers)
		}
	}

	return router
}

func seedDefaultUsers(db *database.Database, userRepo *repository.UserRepository) {
	defaultUsers := []struct {
		username string
		password string
		fullName string
		email    string
		role     models.UserRole
	}{
		{"karyawan", "karyawan123", "Employee User", "karyawan@company.com", models.RoleEmployee},
		{"manager", "manager123", "Manager User", "manager@company.com", models.RoleManager},
		{"finance", "finance123", "Finance User", "finance@company.com", models.RoleFinance},
	}

	for _, u := range defaultUsers {
		// Check if user exists
		_, err := userRepo.GetByUsername(u.username)
		if err == nil {
			// User already exists
			continue
		}

		// Hash password
		hashedPassword, err := utils.HashPassword(u.password)
		if err != nil {
			log.Printf("Failed to hash password for %s: %v", u.username, err)
			continue
		}

		// Create user
		user := &models.User{
			Username: u.username,
			Password: hashedPassword,
			FullName: u.fullName,
			Email:    u.email,
			Role:     u.role,
		}

		if err := userRepo.Create(user); err != nil {
			log.Printf("Failed to create user %s: %v", u.username, err)
		} else {
			log.Printf("Created default user: %s", u.username)
		}
	}
}
