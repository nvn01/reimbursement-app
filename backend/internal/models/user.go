package models

import (
	"time"
)

type UserRole string

const (
	RoleEmployee UserRole = "employee"
	RoleManager  UserRole = "manager"
	RoleFinance  UserRole = "finance"
)

type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Password  string    `json:"-" db:"password"`
	FullName  string    `json:"full_name" db:"full_name"`
	Email     string    `json:"email" db:"email"`
	Role      UserRole  `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
