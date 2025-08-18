package models

import (
	"time"

	"gorm.io/gorm"
)

type Message struct {
	ID         uint           `json:"id" gorm:"primarykey"`
	GuestToken string         `json:"guestToken" gorm:"not null"`
	GuestName  string         `json:"guestName" gorm:"not null"`
	Content    string         `json:"content" gorm:"type:text;not null"`
	Status     string         `json:"status" gorm:"default:'unread'"` // unread, read
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}