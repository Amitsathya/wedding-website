package models

import (
	"time"

	"gorm.io/gorm"
)

type RSVP struct {
	ID                  uint           `json:"id" gorm:"primarykey"`
	GuestID             uint           `json:"guestId" gorm:"not null"`
	Response            string         `json:"response" gorm:"not null"` // yes, no, maybe
	PartySize           int            `json:"partySize" gorm:"default:1"`
	MealChoice          string         `json:"mealChoice"`
	DietaryRestrictions string         `json:"dietaryRestrictions" gorm:"type:text"`
	Message             string         `json:"message" gorm:"type:text"`
	RespondedAt         time.Time      `json:"respondedAt"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
	DeletedAt           gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Guest               Guest          `json:"guest" gorm:"foreignKey:GuestID"`
}

type RSVPWithGuest struct {
	ID                  uint        `json:"id"`
	Response            string      `json:"response"`
	PartySize           int         `json:"partySize"`
	MealChoice          string      `json:"mealChoice"`
	DietaryRestrictions string      `json:"dietaryRestrictions"`
	Message             string      `json:"message"`
	RespondedAt         time.Time   `json:"respondedAt"`
	Guest               Guest       `json:"guest"`
}

type RSVPStats struct {
	Total          int64 `json:"total"`
	Yes            int64 `json:"yes"`
	No             int64 `json:"no"`
	Pending        int64 `json:"pending"`
	TotalAttending int64 `json:"totalAttending"`
}