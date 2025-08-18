package models

import (
	"time"
	"database/sql/driver"
	"encoding/json"
	"errors"

	"gorm.io/gorm"
)

// PartyMember represents additional party members
type PartyMember struct {
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	DietaryPreference string `json:"dietaryPreference"`
}

// PartyMembers is a slice of PartyMember that implements driver.Valuer and sql.Scanner
type PartyMembers []PartyMember

func (p PartyMembers) Value() (driver.Value, error) {
	return json.Marshal(p)
}

func (p *PartyMembers) Scan(value interface{}) error {
	if value == nil {
		*p = nil
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	
	return json.Unmarshal(bytes, &p)
}

// AccommodationDates is a slice of strings that implements driver.Valuer and sql.Scanner
type AccommodationDates []string

func (a AccommodationDates) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *AccommodationDates) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}
	
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	
	return json.Unmarshal(bytes, &a)
}

type Guest struct {
	ID                 uint           `json:"id" gorm:"primarykey"`
	FirstName          string         `json:"firstName" gorm:"not null"`
	LastName           string         `json:"lastName" gorm:"not null"`
	Email              string         `json:"email"`
	Phone              string         `json:"phone"`
	InviteToken        string         `json:"inviteToken" gorm:"uniqueIndex;default:null"`
	GuestPortalToken   string         `json:"guestPortalToken" gorm:"uniqueIndex;default:null"`
	RegistrationStatus string         `json:"registrationStatus" gorm:"default:'pending'"` // pending, approved, rejected
	ApprovedAt         *time.Time     `json:"approvedAt"`
	RSVPStatus         string         `json:"rsvpStatus" gorm:"default:'pending'"` // pending, yes, no
	PartySize          int            `json:"partySize" gorm:"default:0"`
	MaxPartySize       int            `json:"maxPartySize" gorm:"default:2"`
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Updated questionnaire fields
	PartyMembers                 PartyMembers       `json:"partyMembers" gorm:"type:jsonb"`
	MainPersonDietaryPreference  string             `json:"mainPersonDietaryPreference"`
	Dec24Attendance              bool               `json:"dec24Attendance"`
	Dec25Attendance              bool               `json:"dec25Attendance"`
	AccommodationDec23           bool               `json:"accommodationDec23"`
	AccommodationDec24           bool               `json:"accommodationDec24"`
	AccommodationDec25           bool               `json:"accommodationDec25"`
	Concerns                     string             `json:"concerns"`
	
	// Relationships
	RSVPs              []RSVP         `json:"rsvps,omitempty" gorm:"foreignKey:GuestID"`
}

