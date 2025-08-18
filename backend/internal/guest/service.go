package guest

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"gorm.io/gorm"
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

func (s *Service) GetAllGuests() ([]Guest, error) {
	var guests []Guest
	err := s.db.Preload("RSVPs").Find(&guests).Error
	return guests, err
}

func (s *Service) GetGuestByID(id uint) (*Guest, error) {
	var guest Guest
	err := s.db.Preload("RSVPs").First(&guest, id).Error
	return &guest, err
}

func (s *Service) GetGuestByToken(token string) (*Guest, error) {
	var guest Guest
	err := s.db.Where("invite_token = ?", token).First(&guest).Error
	return &guest, err
}


func (s *Service) RegisterGuest(firstName, lastName, email, phone string) (*Guest, error) {
	// Generate unique tokens for registration
	inviteToken, err := s.generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate invite token: %w", err)
	}
	
	portalToken, err := s.generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate portal token: %w", err)
	}

	guest := Guest{
		FirstName:          firstName,
		LastName:           lastName,
		Email:              email,
		Phone:              phone,
		InviteToken:        inviteToken,
		GuestPortalToken:   portalToken,
		RegistrationStatus: "pending",
	}

	err = s.db.Create(&guest).Error
	if err != nil {
		return nil, err
	}

	return &guest, nil
}

func (s *Service) RegisterGuestWithQuestionnaire(req RegisterGuestRequest) (*Guest, error) {
	// Generate unique tokens for registration
	inviteToken, err := s.generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate invite token: %w", err)
	}
	
	portalToken, err := s.generateToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate portal token: %w", err)
	}

	guest := Guest{
		FirstName:                   req.FirstName,
		LastName:                    req.LastName,
		Email:                       req.Email,
		Phone:                       req.Phone,
		InviteToken:                 inviteToken,
		GuestPortalToken:            portalToken,
		RegistrationStatus:          "pending",
		PartySize:                   req.PartySize,
		PartyMembers:                req.PartyMembers,
		MainPersonDietaryPreference: req.MainPersonDietaryPreference,
		Dec24Attendance:             req.Dec24.Attendance,
		Dec25Attendance:             req.Dec25.Attendance,
		AccommodationDec23:          req.Accommodation.Dec23,
		AccommodationDec24:          req.Accommodation.Dec24,
		AccommodationDec25:          req.Accommodation.Dec25,
		Concerns:                    req.Concerns,
	}

	err = s.db.Create(&guest).Error
	if err != nil {
		return nil, err
	}

	return &guest, nil
}

func (s *Service) GetPendingRegistrations() ([]Guest, error) {
	var guests []Guest
	err := s.db.Where("registration_status = ?", "pending").Find(&guests).Error
	return guests, err
}

func (s *Service) ApproveGuestRegistration(guestID uint) (*Guest, error) {
	var guest Guest
	err := s.db.First(&guest, guestID).Error
	if err != nil {
		return nil, err
	}

	if guest.RegistrationStatus != "pending" {
		return nil, fmt.Errorf("guest registration is not pending")
	}

	// Generate tokens
	inviteToken, err := s.generateToken()
	if err != nil {
		return nil, err
	}

	portalToken, err := s.generateToken()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	guest.InviteToken = inviteToken
	guest.GuestPortalToken = portalToken
	guest.RegistrationStatus = "approved"
	guest.ApprovedAt = &now

	err = s.db.Save(&guest).Error
	if err != nil {
		return nil, err
	}

	// Send notification email/SMS with invite token
	err = s.sendApprovalNotification(&guest)
	if err != nil {
		s.logger.Error("Failed to send approval notification", "error", err, "guest", guest.ID)
	}

	return &guest, nil
}

func (s *Service) RejectGuestRegistration(guestID uint) error {
	var guest Guest
	err := s.db.First(&guest, guestID).Error
	if err != nil {
		return err
	}

	if guest.RegistrationStatus != "pending" {
		return fmt.Errorf("guest registration is not pending")
	}

	guest.RegistrationStatus = "rejected"
	return s.db.Save(&guest).Error
}

func (s *Service) GetGuestByPortalToken(token string) (*Guest, error) {
	var guest Guest
	err := s.db.Where("guest_portal_token = ?", token).First(&guest).Error
	return &guest, err
}

func (s *Service) generateToken() (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}


func (s *Service) sendApprovalNotification(guest *Guest) error {
	// Generate URLs for the guest
	rsvpURL := fmt.Sprintf("https://yourdomain.com/rsvp/%s", guest.InviteToken)
	portalURL := fmt.Sprintf("https://yourdomain.com/guest-portal/%s", guest.GuestPortalToken)
	
	// Email content
	emailSubject := "Your Wedding RSVP is Ready!"
	emailBody := fmt.Sprintf(`
		Hi %s,

		Great news! Your registration has been approved. You can now RSVP for the wedding.

		🎉 RSVP Link: %s
		📸 Your Personal Portal: %s

		After you complete your RSVP, you'll be able to use your personal portal to:
		- Upload photos from the wedding
		- Send messages to the couple
		- View wedding updates

		We can't wait to celebrate with you!

		Best regards,
		The Happy Couple
	`, guest.FirstName, rsvpURL, portalURL)

	// SMS content (shorter version)
	smsMessage := fmt.Sprintf("Hi %s! Your wedding RSVP is ready: %s. Your personal portal: %s", 
		guest.FirstName, rsvpURL, portalURL)
	
	// TODO: Implement actual email/SMS sending
	// Example integrations:
	
	// For Email (using SendGrid, SES, etc.):
	// emailService.Send(guest.Email, emailSubject, emailBody)
	
	// For SMS (using Twilio, AWS SNS, etc.):
	// if guest.Phone != "" {
	//     smsService.Send(guest.Phone, smsMessage)
	// }
	
	s.logger.Info("Approval notification sent", 
		"email", guest.Email, 
		"phone", guest.Phone,
		"rsvpURL", rsvpURL,
		"portalURL", portalURL,
		"emailSubject", emailSubject,
		"emailBody", emailBody,
		"smsMessage", smsMessage,
	)
	
	return nil
}

func (s *Service) DeleteAllGuests() error {
	// Delete all RSVPs first (due to foreign key constraint)
	err := s.db.Exec("DELETE FROM rsvps").Error
	if err != nil {
		return fmt.Errorf("failed to delete RSVPs: %w", err)
	}

	// Delete all messages
	err = s.db.Exec("DELETE FROM messages").Error
	if err != nil {
		s.logger.Warn("Failed to delete messages", "error", err)
	}

	// Delete all photos uploaded by guests
	err = s.db.Exec("DELETE FROM photos WHERE guest_token IS NOT NULL").Error
	if err != nil {
		s.logger.Warn("Failed to delete guest photos", "error", err)
	}

	// Delete all guests
	err = s.db.Exec("DELETE FROM guests").Error
	if err != nil {
		return fmt.Errorf("failed to delete guests: %w", err)
	}

	s.logger.Info("All guests, RSVPs, messages, and guest photos deleted")
	return nil
}

func (s *Service) DeleteSelectedGuests(guestIDs []uint) error {
	if len(guestIDs) == 0 {
		return fmt.Errorf("no guest IDs provided")
	}

	// Delete RSVPs for selected guests
	err := s.db.Where("guest_id IN ?", guestIDs).Delete(&RSVP{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete RSVPs: %w", err)
	}

	// Delete messages from selected guests
	err = s.db.Exec("DELETE FROM messages WHERE guest_token IN (SELECT guest_portal_token FROM guests WHERE id IN ?)", guestIDs).Error
	if err != nil {
		s.logger.Warn("Failed to delete messages for selected guests", "error", err)
	}

	// Delete photos uploaded by selected guests
	err = s.db.Exec("DELETE FROM photos WHERE guest_token IN (SELECT guest_portal_token FROM guests WHERE id IN ?)", guestIDs).Error
	if err != nil {
		s.logger.Warn("Failed to delete photos for selected guests", "error", err)
	}

	// Delete selected guests
	err = s.db.Where("id IN ?", guestIDs).Delete(&Guest{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete selected guests: %w", err)
	}

	s.logger.Info("Selected guests deleted", "count", len(guestIDs), "guestIDs", guestIDs)
	return nil
}