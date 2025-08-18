package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"wedding-app/pkg/logger"
)

type Service struct {
	db     *gorm.DB
	logger logger.Logger
	secret []byte
}

func NewService(db *gorm.DB, logger logger.Logger) *Service {
	// In production, load this from environment variable
	secret := []byte("your-super-secret-key-change-this-in-production")
	
	return &Service{
		db:     db,
		logger: logger,
		secret: secret,
	}
}

func (s *Service) Login(email, password string) (string, *User, error) {
	var user User
	err := s.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil, errors.New("invalid credentials")
		}
		s.logger.Error("Database error during login", "error", err)
		return "", nil, err
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateToken(&user)
	if err != nil {
		s.logger.Error("Failed to generate token", "error", err)
		return "", nil, err
	}

	// Update last login
	user.LastLogin = time.Now()
	s.db.Save(&user)

	// Don't return password hash
	user.PasswordHash = ""

	return token, &user, nil
}

func (s *Service) ValidateToken(tokenString string) (*User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return s.secret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("invalid user ID in token")
	}

	var user User
	err = s.db.First(&user, uint(userID)).Error
	if err != nil {
		return nil, errors.New("user not found")
	}

	user.PasswordHash = "" // Don't expose password hash
	return &user, nil
}

func (s *Service) generateToken(user *User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *Service) CreateUser(email, password string) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         "admin",
		Status:       "active",
	}

	err = s.db.Create(&user).Error
	if err != nil {
		return nil, err
	}

	user.PasswordHash = ""
	return &user, nil
}