package photo

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) GetPhotos(c *gin.Context) {
	photos, err := h.service.GetApprovedPhotos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch photos"})
		return
	}

	c.JSON(http.StatusOK, photos)
}

type UploadURLRequest struct {
	FileName   string `json:"fileName" binding:"required"`
	FileType   string `json:"fileType" binding:"required"`
	FileSize   int64  `json:"fileSize" binding:"required"`
	GuestToken string `json:"guestToken"`
	GuestName  string `json:"guestName"`
}

func (h *Handler) GetUploadURL(c *gin.Context) {
	var req UploadURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate file type
	if !h.service.IsValidImageType(req.FileType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only images are allowed."})
		return
	}

	// Validate file size (10MB limit)
	if req.FileSize > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size too large. Maximum 10MB allowed."})
		return
	}

	uploadURL, photoID, err := h.service.GenerateUploadURL(req.FileName, req.FileType, req.FileSize, req.GuestToken, req.GuestName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate upload URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uploadUrl": uploadURL,
		"photoId":   photoID,
	})
}

type CompleteUploadRequest struct {
	PhotoID  uint   `json:"photoId" binding:"required"`
	FileName string `json:"fileName" binding:"required"`
}

func (h *Handler) CompleteUpload(c *gin.Context) {
	var req CompleteUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	photo, err := h.service.CompleteUpload(req.PhotoID, req.FileName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, photo)
}

// Admin endpoints

func (h *Handler) GetAdminPhotos(c *gin.Context) {
	photos, err := h.service.GetAllPhotos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch photos"})
		return
	}

	c.JSON(http.StatusOK, photos)
}

func (h *Handler) GetPendingPhotos(c *gin.Context) {
	photos, err := h.service.GetPendingPhotos()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending photos"})
		return
	}

	c.JSON(http.StatusOK, photos)
}

func (h *Handler) ApprovePhoto(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}

	err = h.service.ApprovePhoto(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo approved successfully"})
}

func (h *Handler) RejectPhoto(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}

	err = h.service.RejectPhoto(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo rejected successfully"})
}

func (h *Handler) DeletePhoto(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}

	err = h.service.DeletePhoto(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo deleted successfully"})
}