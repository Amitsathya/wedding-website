package database

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"wedding-app/internal/auth"
	"wedding-app/internal/models"
)

func Connect() (*gorm.DB, error) {
	// Build connection string from environment variables
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "wedding_user")
	password := getEnv("DB_PASSWORD", "wedding_password")
	dbname := getEnv("DB_NAME", "wedding_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto-migrate all models
	err = AutoMigrate(db)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate: %w", err)
	}

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	// Create tables without foreign key constraints first
	if err := db.Migrator().CreateTable(&auth.User{}); err != nil && !db.Migrator().HasTable(&auth.User{}) {
		return fmt.Errorf("failed to create User table: %w", err)
	}
	
	
	
	if err := db.Migrator().CreateTable(&models.Photo{}); err != nil && !db.Migrator().HasTable(&models.Photo{}) {
		return fmt.Errorf("failed to create Photo table: %w", err)
	}
	
	if err := db.Migrator().CreateTable(&models.Album{}); err != nil && !db.Migrator().HasTable(&models.Album{}) {
		return fmt.Errorf("failed to create Album table: %w", err)
	}
	
	if err := db.Migrator().CreateTable(&models.Guest{}); err != nil && !db.Migrator().HasTable(&models.Guest{}) {
		return fmt.Errorf("failed to create Guest table: %w", err)
	}
	
	if err := db.Migrator().CreateTable(&models.RSVP{}); err != nil && !db.Migrator().HasTable(&models.RSVP{}) {
		return fmt.Errorf("failed to create RSVP table: %w", err)
	}
	
	if err := db.Migrator().CreateTable(&models.Message{}); err != nil && !db.Migrator().HasTable(&models.Message{}) {
		return fmt.Errorf("failed to create Message table: %w", err)
	}
	
	// Now run full AutoMigrate to add constraints and relationships
	return db.AutoMigrate(
		&auth.User{},
		&models.Photo{},
		&models.Album{},
		&models.Guest{},
		&models.RSVP{},
		&models.Message{},
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}