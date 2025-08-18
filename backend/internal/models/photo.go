package models

import (
	"time"

	"gorm.io/gorm"
)

type Photo struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	FileName     string         `json:"fileName" gorm:"not null"`
	S3Key        string         `json:"s3Key" gorm:"unique;not null"`
	ThumbnailKey string         `json:"thumbnailKey"`
	ContentType  string         `json:"contentType" gorm:"not null"`
	FileSize     int64          `json:"fileSize" gorm:"not null"`
	Status       string         `json:"status" gorm:"default:'pending'"` // uploading, pending, approved, rejected
	UploadedBy   string         `json:"uploadedBy"`
	GuestToken   string         `json:"guestToken"`
	GuestName    string         `json:"guestName"`
	UploadedAt   time.Time      `json:"uploadedAt"`
	ModeratedAt  *time.Time     `json:"moderatedAt"`
	Width        int            `json:"width" gorm:"default:0"`
	Height       int            `json:"height" gorm:"default:0"`
	AlbumID      *uint          `json:"albumId" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Generated URLs (not stored in DB)
	ThumbnailURL string         `json:"thumbnailUrl" gorm:"-"`
	FullURL      string         `json:"fullUrl" gorm:"-"`
}

type Album struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description" gorm:"type:text"`
	Visibility  string         `json:"visibility" gorm:"default:'public'"` // public, private
	CoverPhotoID *uint         `json:"coverPhotoId"`
	PhotoCount  int            `json:"photoCount" gorm:"default:0"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Photos      []Photo        `json:"photos,omitempty" gorm:"foreignKey:AlbumID"`
	CoverPhoto  *Photo         `json:"coverPhoto,omitempty" gorm:"foreignKey:CoverPhotoID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}