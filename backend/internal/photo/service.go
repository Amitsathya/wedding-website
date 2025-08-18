package photo

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"gorm.io/gorm"
	"wedding-app/pkg/logger"
	"wedding-app/pkg/storage"
)

type Service struct {
	db      *gorm.DB
	logger  logger.Logger
	storage storage.Client
}

func NewService(db *gorm.DB, logger logger.Logger) *Service {
	// Initialize S3 client
	storageClient := storage.NewS3Client()
	
	return &Service{
		db:      db,
		logger:  logger,
		storage: storageClient,
	}
}

func (s *Service) GetApprovedPhotos() ([]Photo, error) {
	var photos []Photo
	err := s.db.Where("status = ?", "approved").Order("created_at DESC").Find(&photos).Error
	if err != nil {
		return nil, err
	}

	// Generate signed URLs
	for i := range photos {
		photos[i].ThumbnailURL = s.storage.GeneratePresignedURL(photos[i].ThumbnailKey, 24*time.Hour)
		photos[i].FullURL = s.storage.GeneratePresignedURL(photos[i].S3Key, 24*time.Hour)
	}

	return photos, nil
}

func (s *Service) GetAllPhotos() ([]Photo, error) {
	var photos []Photo
	err := s.db.Order("created_at DESC").Find(&photos).Error
	if err != nil {
		return nil, err
	}

	// Generate signed URLs
	for i := range photos {
		photos[i].ThumbnailURL = s.storage.GeneratePresignedURL(photos[i].ThumbnailKey, 24*time.Hour)
		photos[i].FullURL = s.storage.GeneratePresignedURL(photos[i].S3Key, 24*time.Hour)
	}

	return photos, nil
}

func (s *Service) GetPendingPhotos() ([]Photo, error) {
	var photos []Photo
	err := s.db.Where("status = ?", "pending").Order("created_at ASC").Find(&photos).Error
	if err != nil {
		return nil, err
	}

	// Generate signed URLs
	for i := range photos {
		photos[i].ThumbnailURL = s.storage.GeneratePresignedURL(photos[i].ThumbnailKey, 24*time.Hour)
		photos[i].FullURL = s.storage.GeneratePresignedURL(photos[i].S3Key, 24*time.Hour)
	}

	return photos, nil
}

func (s *Service) IsValidImageType(contentType string) bool {
	validTypes := []string{
		"image/jpeg",
		"image/jpg", 
		"image/png",
		"image/gif",
		"image/webp",
	}

	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

func (s *Service) GenerateUploadURL(fileName, fileType string, fileSize int64, guestToken, guestName string) (string, uint, error) {
	// Generate unique key
	key, err := s.generatePhotoKey(fileName)
	if err != nil {
		return "", 0, err
	}

	// Create photo record
	photo := Photo{
		FileName:    fileName,
		S3Key:       key,
		ContentType: fileType,
		FileSize:    fileSize,
		Status:      "uploading",
		GuestToken:  guestToken,
		GuestName:   guestName,
	}

	err = s.db.Create(&photo).Error
	if err != nil {
		return "", 0, err
	}

	// Generate presigned upload URL
	uploadURL, err := s.storage.GeneratePresignedUploadURL(key, fileType, 15*time.Minute)
	if err != nil {
		return "", 0, err
	}

	return uploadURL, photo.ID, nil
}

func (s *Service) CompleteUpload(photoID uint, fileName string) (*Photo, error) {
	var photo Photo
	err := s.db.First(&photo, photoID).Error
	if err != nil {
		return nil, err
	}

	if photo.Status != "uploading" {
		return nil, fmt.Errorf("photo is not in uploading state")
	}

	// Update photo status
	photo.Status = "pending" // Requires moderation
	photo.UploadedAt = time.Now()

	// Generate thumbnail key
	photo.ThumbnailKey = s.generateThumbnailKey(photo.S3Key)

	err = s.db.Save(&photo).Error
	if err != nil {
		return nil, err
	}

	// Trigger background processing (thumbnail generation, moderation)
	go s.processPhoto(&photo)

	// Generate URLs for response
	photo.ThumbnailURL = s.storage.GeneratePresignedURL(photo.ThumbnailKey, 24*time.Hour)
	photo.FullURL = s.storage.GeneratePresignedURL(photo.S3Key, 24*time.Hour)

	return &photo, nil
}

func (s *Service) ApprovePhoto(photoID uint) error {
	var photo Photo
	err := s.db.First(&photo, photoID).Error
	if err != nil {
		return err
	}

	photo.Status = "approved"
	photo.ModeratedAt = &time.Time{}
	*photo.ModeratedAt = time.Now()

	return s.db.Save(&photo).Error
}

func (s *Service) RejectPhoto(photoID uint) error {
	var photo Photo
	err := s.db.First(&photo, photoID).Error
	if err != nil {
		return err
	}

	photo.Status = "rejected"
	photo.ModeratedAt = &time.Time{}
	*photo.ModeratedAt = time.Now()

	return s.db.Save(&photo).Error
}

func (s *Service) DeletePhoto(photoID uint) error {
	var photo Photo
	err := s.db.First(&photo, photoID).Error
	if err != nil {
		return err
	}

	// Delete from S3
	err = s.storage.DeleteObject(photo.S3Key)
	if err != nil {
		s.logger.Error("Failed to delete photo from S3", "error", err, "key", photo.S3Key)
	}

	if photo.ThumbnailKey != "" {
		err = s.storage.DeleteObject(photo.ThumbnailKey)
		if err != nil {
			s.logger.Error("Failed to delete thumbnail from S3", "error", err, "key", photo.ThumbnailKey)
		}
	}

	// Delete from database
	return s.db.Delete(&photo).Error
}

func (s *Service) generatePhotoKey(fileName string) (string, error) {
	// Generate random bytes for unique key
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	randomHex := hex.EncodeToString(bytes)
	extension := filepath.Ext(fileName)
	
	// Format: photos/2024/01/15/abc123def456.jpg
	now := time.Now()
	key := fmt.Sprintf("photos/%04d/%02d/%02d/%s%s", 
		now.Year(), now.Month(), now.Day(), randomHex, extension)
	
	return key, nil
}

func (s *Service) generateThumbnailKey(originalKey string) string {
	// Replace the file extension with _thumb.jpg
	extension := filepath.Ext(originalKey)
	baseKey := strings.TrimSuffix(originalKey, extension)
	return baseKey + "_thumb.jpg"
}

func (s *Service) processPhoto(photo *Photo) {
	s.logger.Info("Processing photo", "id", photo.ID, "key", photo.S3Key)

	// TODO: Implement background processing
	// 1. Generate thumbnail
	// 2. Run content moderation (AWS Rekognition, Google Vision API, etc.)
	// 3. Extract EXIF data
	// 4. Virus scan
	
	// For now, just log
	s.logger.Info("Photo processing complete", "id", photo.ID)
}