package message

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"wedding-app/internal/models"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type SendMessageRequest struct {
	GuestToken string `json:"guestToken" binding:"required"`
	GuestName  string `json:"guestName" binding:"required"`
	Message    string `json:"message" binding:"required"`
}

func (h *Handler) SendMessage(c *gin.Context) {
	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create message record
	message := models.Message{
		GuestToken: req.GuestToken,
		GuestName:  req.GuestName,
		Content:    req.Message,
		Status:     "unread",
	}

	err := h.db.Create(&message).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Message sent successfully",
		"id":      message.ID,
	})
}

func (h *Handler) GetMessages(c *gin.Context) {
	var messages []models.Message
	err := h.db.Order("created_at DESC").Find(&messages).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	// Count unread messages
	var unreadCount int64
	h.db.Model(&models.Message{}).Where("status = ?", "unread").Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"messages":     messages,
		"unreadCount": unreadCount,
	})
}

func (h *Handler) MarkMessageAsRead(c *gin.Context) {
	messageID := c.Param("id")
	
	err := h.db.Model(&models.Message{}).Where("id = ?", messageID).Update("status", "read").Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message marked as read"})
}