package rsvp

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"gorm.io/gorm"
	"wedding-app/internal/guest"
	"wedding-app/internal/models"
	"wedding-app/pkg/logger"
)

type Service struct {
	db     *gorm.DB
	logger logger.Logger
}


func NewService(db *gorm.DB, logger logger.Logger) *Service {
	return &Service{
		db:     db,
		logger: logger,
	}
}

func (s *Service) GetGuestByToken(token string) (*guest.Guest, error) {
	var g guest.Guest
	err := s.db.Where("invite_token = ?", token).First(&g).Error
	return &g, err
}

func (s *Service) SubmitRSVP(token, response, message string, updatedDetails *UpdatedDetailsStruct) error {
	// Find guest by token
	var g guest.Guest
	err := s.db.Where("invite_token = ?", token).First(&g).Error
	if err != nil {
		return fmt.Errorf("invalid RSVP token")
	}

	// Update guest RSVP status
	g.RSVPStatus = response

	// If updated details are provided, update the guest questionnaire data
	if updatedDetails != nil {
		// Allow party size increase during RSVP if reasonable (up to 10 people)
		if updatedDetails.PartySize > 10 {
			return fmt.Errorf("party size exceeds maximum allowed (10)")
		}
		
		// Update MaxPartySize if needed
		if updatedDetails.PartySize > g.MaxPartySize {
			g.MaxPartySize = updatedDetails.PartySize
		}

		g.PartySize = updatedDetails.PartySize
		g.MainPersonDietaryPreference = updatedDetails.MainPersonDietaryPreference
		g.Dec24Attendance = updatedDetails.Dec24Attendance
		g.Dec25Attendance = updatedDetails.Dec25Attendance
		g.AccommodationDec23 = updatedDetails.AccommodationDec23
		g.AccommodationDec24 = updatedDetails.AccommodationDec24
		g.AccommodationDec25 = updatedDetails.AccommodationDec25
		g.Concerns = updatedDetails.Concerns

		// Handle party members - convert interface{} to proper type
		if updatedDetails.PartyMembers != nil {
			// Convert the interface{} to JSON and then parse as PartyMembers
			partyMembersJSON, err := json.Marshal(updatedDetails.PartyMembers)
			if err != nil {
				return fmt.Errorf("failed to process party members: %w", err)
			}
			
			var partyMembers models.PartyMembers
			err = json.Unmarshal(partyMembersJSON, &partyMembers)
			if err != nil {
				return fmt.Errorf("failed to parse party members: %w", err)
			}
			
			g.PartyMembers = partyMembers
		}
	}

	// Create RSVP record
	rsvp := RSVP{
		GuestID:             g.ID,
		Response:            response,
		PartySize:           g.PartySize,
		Message:             message,
		RespondedAt:         time.Now(),
	}

	// Use transaction to ensure both updates succeed
	tx := s.db.Begin()

	if err := tx.Save(&g).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update guest: %w", err)
	}

	if err := tx.Create(&rsvp).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create RSVP: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	s.logger.Info("RSVP submitted", "guest", g.FirstName+" "+g.LastName, "response", response, "partySize", g.PartySize)

	// TODO: Send confirmation email
	go s.sendConfirmationEmail(&g, &rsvp)

	return nil
}

func (s *Service) GetAllRSVPs() ([]RSVPWithGuest, *RSVPStats, error) {
	var rsvps []RSVP
	err := s.db.Preload("Guest").Order("responded_at DESC").Find(&rsvps).Error
	if err != nil {
		return nil, nil, err
	}

	// Convert to response format
	var result []RSVPWithGuest
	for _, rsvp := range rsvps {
		result = append(result, RSVPWithGuest{
			ID:                  rsvp.ID,
			Response:            rsvp.Response,
			PartySize:           rsvp.PartySize,
			MealChoice:          rsvp.MealChoice,
			DietaryRestrictions: rsvp.DietaryRestrictions,
			Message:             rsvp.Message,
			RespondedAt:         rsvp.RespondedAt,
			Guest:               rsvp.Guest,
		})
	}

	// Calculate stats
	stats, err := s.calculateStats()
	if err != nil {
		return result, nil, err
	}

	return result, stats, nil
}

func (s *Service) calculateStats() (*RSVPStats, error) {
	var stats RSVPStats

	// Count total guests
	err := s.db.Model(&guest.Guest{}).Count(&stats.Total).Error
	if err != nil {
		return nil, err
	}

	// Count by RSVP status
	err = s.db.Model(&guest.Guest{}).Where("rsvp_status = ?", "yes").Count(&stats.Yes).Error
	if err != nil {
		return nil, err
	}

	err = s.db.Model(&guest.Guest{}).Where("rsvp_status = ?", "no").Count(&stats.No).Error
	if err != nil {
		return nil, err
	}

	err = s.db.Model(&guest.Guest{}).Where("rsvp_status = ?", "pending").Count(&stats.Pending).Error
	if err != nil {
		return nil, err
	}

	// Calculate total attending (sum of party sizes for "yes" responses)
	var totalAttending int64
	err = s.db.Model(&guest.Guest{}).Where("rsvp_status = ?", "yes").Select("COALESCE(SUM(party_size), 0)").Scan(&totalAttending).Error
	if err != nil {
		return nil, err
	}
	stats.TotalAttending = totalAttending

	return &stats, nil
}

func (s *Service) ExportRSVPsToCSV() (string, error) {
	var guests []guest.Guest
	err := s.db.Preload("RSVPs").Find(&guests).Error
	if err != nil {
		return "", err
	}

	var buffer bytes.Buffer
	writer := csv.NewWriter(&buffer)

	// Write header with comprehensive questionnaire fields
	header := []string{
		"First Name", "Last Name", "Email", "Phone",
		"RSVP Status", "Party Size", "Main Person Dietary",
		"Party Members", "Party Member Dietaries",
		"Dec 24 Attendance", "Dec 25 Attendance",
		"Accommodation Dec 23", "Accommodation Dec 24", "Accommodation Dec 25",
		"Special Concerns", "RSVP Message", "Responded At",
	}
	writer.Write(header)

	// Write data
	for _, g := range guests {
		var message, respondedAt string
		
		if len(g.RSVPs) > 0 {
			// Get the most recent RSVP
			rsvp := g.RSVPs[len(g.RSVPs)-1]
			message = rsvp.Message
			respondedAt = rsvp.RespondedAt.Format("2006-01-02 15:04:05")
		}

		// Build party members string
		var partyMembersStr, partyDietariesStr string
		if len(g.PartyMembers) > 0 {
			var memberNames, memberDietaries []string
			for _, member := range g.PartyMembers {
				memberNames = append(memberNames, member.FirstName+" "+member.LastName)
				memberDietaries = append(memberDietaries, member.DietaryPreference)
			}
			partyMembersStr = fmt.Sprintf("\"%s\"", fmt.Sprintf("%v", memberNames))
			partyDietariesStr = fmt.Sprintf("\"%s\"", fmt.Sprintf("%v", memberDietaries))
		}

		// Convert boolean values to readable strings
		dec24Attendance := "No"
		if g.Dec24Attendance {
			dec24Attendance = "Yes"
		}
		
		dec25Attendance := "No"
		if g.Dec25Attendance {
			dec25Attendance = "Yes"
		}
		
		accommodationDec23 := "No"
		if g.AccommodationDec23 {
			accommodationDec23 = "Yes"
		}
		
		accommodationDec24 := "No"
		if g.AccommodationDec24 {
			accommodationDec24 = "Yes"
		}
		
		accommodationDec25 := "No"
		if g.AccommodationDec25 {
			accommodationDec25 = "Yes"
		}

		row := []string{
			g.FirstName,
			g.LastName,
			g.Email,
			g.Phone,
			g.RSVPStatus,
			strconv.Itoa(g.PartySize),
			g.MainPersonDietaryPreference,
			partyMembersStr,
			partyDietariesStr,
			dec24Attendance,
			dec25Attendance,
			accommodationDec23,
			accommodationDec24,
			accommodationDec25,
			g.Concerns,
			message,
			respondedAt,
		}
		writer.Write(row)
	}

	writer.Flush()
	return buffer.String(), nil
}

func (s *Service) sendConfirmationEmail(g *guest.Guest, rsvp *RSVP) {
	// TODO: Implement email confirmation sending
	s.logger.Info("Sending RSVP confirmation email", "guest", g.Email, "response", rsvp.Response)
}