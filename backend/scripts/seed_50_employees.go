package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Get database connection from environment variables
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	if dbHost == "" {
		dbHost = "100.100.20.1"
	}
	if dbPort == "" {
		dbPort = "5432"
	}
	if dbUser == "" {
		dbUser = "nvn"
	}
	if dbPassword == "" {
		dbPassword = "tomato"
	}
	if dbName == "" {
		dbName = "reimbursement_db"
	}
	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	// Database connection
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("✓ Connected to database")
	fmt.Println("\nCreating 50 employee users...")
	fmt.Println("========================================")

	successCount := 0
	skipCount := 0
	errorCount := 0

	// Create 50 employees
	for i := 1; i <= 50; i++ {
		username := fmt.Sprintf("karyawan%d", i)
		password := "karyawan123" // Same password for all
		fullName := fmt.Sprintf("Karyawan %d", i)
		email := fmt.Sprintf("karyawan%d@company.com", i)
		role := "employee"

		// Check if user already exists
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&exists)
		if err != nil {
			log.Printf("❌ Error checking user %s: %v", username, err)
			errorCount++
			continue
		}

		if exists {
			fmt.Printf("⊘ User %s already exists, skipping...\n", username)
			skipCount++
			continue
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ Failed to hash password for %s: %v", username, err)
			errorCount++
			continue
		}

		// Insert user
		_, err = db.Exec(
			"INSERT INTO users (username, password, full_name, email, role) VALUES ($1, $2, $3, $4, $5)",
			username, string(hashedPassword), fullName, email, role,
		)
		if err != nil {
			log.Printf("❌ Failed to create user %s: %v", username, err)
			errorCount++
			continue
		}

		fmt.Printf("✓ Created user: %s (%s)\n", username, fullName)
		successCount++
	}

	fmt.Println("\n========================================")
	fmt.Println("Summary:")
	fmt.Printf("  ✓ Created: %d users\n", successCount)
	fmt.Printf("  ⊘ Skipped: %d users (already exist)\n", skipCount)
	if errorCount > 0 {
		fmt.Printf("  ❌ Errors: %d users\n", errorCount)
	}
	fmt.Println("\n✅ Employee seeding completed!")
	fmt.Println("\nAll employees can login with:")
	fmt.Println("  Username: karyawan1 to karyawan50")
	fmt.Println("  Password: karyawan123")
}
