package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"wedding-app/internal/auth"
	"wedding-app/internal/guest"
	"wedding-app/internal/message"
	"wedding-app/internal/photo"
	"wedding-app/internal/rsvp"
	"wedding-app/pkg/database"
	"wedding-app/pkg/logger"
)

func main() {
	// Initialize logger
	logger := logger.New()

	// Initialize database
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize services
	authService := auth.NewService(db, logger)
	guestService := guest.NewService(db, logger)
	rsvpService := rsvp.NewService(db, logger)
	photoService := photo.NewService(db, logger)

	// Initialize handlers
	authHandler := auth.NewHandler(authService)
	guestHandler := guest.NewHandler(guestService)
	rsvpHandler := rsvp.NewHandler(rsvpService)
	photoHandler := photo.NewHandler(photoService)
	messageHandler := message.NewHandler(db)

	// Setup router
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "https://yourdomain.com"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// API routes
	api := router.Group("/api")
	{
		// Public routes
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/register", authHandler.Register) // Temporary for creating admin user
		api.GET("/rsvp/:token", rsvpHandler.GetRSVP)
		api.POST("/rsvp/:token/submit", rsvpHandler.SubmitRSVP)
		api.GET("/photos", photoHandler.GetPhotos)
		api.POST("/photos/upload-url", photoHandler.GetUploadURL)
		api.POST("/photos/complete", photoHandler.CompleteUpload)
		
		// Guest registration (public)
		api.POST("/guests/register", guestHandler.RegisterGuest)
		
		// Guest portal (public with token)
		api.GET("/guest-portal/:token", guestHandler.GetGuestPortal)
		
		// Guest messaging (public)
		api.POST("/messages", messageHandler.SendMessage)
		
		// Debug route (public for testing)
		api.GET("/debug/routes", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Public routes are working", "available_routes": []string{
				"POST /api/guests/register",
				"GET /api/guest-portal/:token", 
				"POST /api/messages",
				"GET /api/debug/routes",
			}})
		})

		// Protected routes
		protected := api.Group("/")
		protected.Use(authHandler.RequireAuth())
		{
			// Auth
			protected.POST("/auth/logout", authHandler.Logout)
			protected.GET("/auth/me", authHandler.Me)

			// Guests
			protected.GET("/guests", guestHandler.GetGuests)
			protected.GET("/guests/pending", guestHandler.GetPendingRegistrations)
			protected.POST("/guests/:id/approve", guestHandler.ApproveRegistration)
			protected.POST("/guests/:id/reject", guestHandler.RejectRegistration)
			protected.DELETE("/guests/all", guestHandler.DeleteAllGuests)
			protected.POST("/guests/delete-selected", guestHandler.DeleteSelectedGuests)
			protected.GET("/guests/test", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Guest routes are working"})
			})
			
			// Messages
			protected.GET("/messages", messageHandler.GetMessages)
			protected.PATCH("/messages/:id/read", messageHandler.MarkMessageAsRead)

			// RSVPs
			protected.GET("/rsvps", rsvpHandler.GetRSVPs)
			protected.GET("/rsvps/export", rsvpHandler.ExportRSVPs)

			// Admin photo management
			admin := protected.Group("/admin")
			{
				admin.GET("/photos", photoHandler.GetAdminPhotos)
				admin.GET("/photos/pending", photoHandler.GetPendingPhotos)
				admin.PATCH("/photos/:id/approve", photoHandler.ApprovePhoto)
				admin.PATCH("/photos/:id/reject", photoHandler.RejectPhoto)
				admin.DELETE("/photos/:id", photoHandler.DeletePhoto)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Server starting on port " + port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}