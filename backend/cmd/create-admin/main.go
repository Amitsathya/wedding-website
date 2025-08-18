package main

import (
	"fmt"
	"log"
	"wedding-app/internal/auth"
	"wedding-app/pkg/database"
	"wedding-app/pkg/logger"
)

func main() {
	logger := logger.New()
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	authService := auth.NewService(db, logger)
	
	// Check if admin user already exists
	var existingUser auth.User
	result := db.Where("email = ?", "admin@wedding.com").First(&existingUser)
	if result.Error == nil {
		fmt.Println("Admin user already exists: admin@wedding.com")
		return
	}
	
	// Create default admin user
	user, err := authService.CreateUser("admin@wedding.com", "password123")
	if err != nil {
		fmt.Printf("Error creating user: %v\n", err)
		return
	}
	
	fmt.Printf("Created admin user: %s\n", user.Email)
	fmt.Println("Login credentials:")
	fmt.Println("  Email: admin@wedding.com")
	fmt.Println("  Password: password123")
}