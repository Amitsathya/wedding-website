package guest

import (
	"fmt"
	"net/http"
	"strconv"
	"wedding-app/internal/models"

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

func (h *Handler) GetGuests(c *gin.Context) {
	guests, err := h.service.GetAllGuests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch guests"})
		return
	}

	c.JSON(http.StatusOK, guests)
}


type RegisterGuestRequest struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone"`
	
	// Updated questionnaire fields
	PartySize                    int                        `json:"partySize"`
	PartyMembers                 models.PartyMembers        `json:"partyMembers"`
	MainPersonDietaryPreference  string                     `json:"mainPersonDietaryPreference"`
	Dec24                        EventAttendance            `json:"dec24"`
	Dec25                        EventAttendance            `json:"dec25"`
	Accommodation                AccommodationData          `json:"accommodation"`
	Concerns                     string                     `json:"concerns"`
}

type EventAttendance struct {
	Attendance bool `json:"attendance"`
}

type AccommodationData struct {
	Dec23 bool `json:"dec23"`
	Dec24 bool `json:"dec24"`
	Dec25 bool `json:"dec25"`
}

func (h *Handler) RegisterGuest(c *gin.Context) {
	var req RegisterGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Received registration request: %+v\n", req)
	fmt.Printf("Party size: %d, Dec24 attendance: %t, Dec25 attendance: %t, Concerns: %s\n", 
		req.PartySize, req.Dec24.Attendance, req.Dec25.Attendance, req.Concerns)

	guest, err := h.service.RegisterGuestWithQuestionnaire(req)
	if err != nil {
		fmt.Printf("Service error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register guest"})
		return
	}

	fmt.Printf("Successfully created guest with ID: %d\n", guest.ID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration submitted successfully",
		"guest":   guest,
	})
}

func (h *Handler) GetPendingRegistrations(c *gin.Context) {
	guests, err := h.service.GetPendingRegistrations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending registrations"})
		return
	}

	c.JSON(http.StatusOK, guests)
}

func (h *Handler) ApproveRegistration(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid guest ID"})
		return
	}

	guest, err := h.service.ApproveGuestRegistration(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guest registration approved successfully",
		"guest":   guest,
	})
}

func (h *Handler) RejectRegistration(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid guest ID"})
		return
	}

	err = h.service.RejectGuestRegistration(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guest registration rejected",
	})
}

func (h *Handler) GetGuestPortal(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	guest, err := h.service.GetGuestByPortalToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid guest portal link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"firstName": guest.FirstName,
		"lastName":  guest.LastName,
		"email":     guest.Email,
		"phone":     guest.Phone,
	})
}

func (h *Handler) DeleteAllGuests(c *gin.Context) {
	err := h.service.DeleteAllGuests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "All guests deleted successfully",
	})
}

type DeleteSelectedGuestsRequest struct {
	GuestIDs []uint `json:"guestIds" binding:"required"`
}

func (h *Handler) DeleteSelectedGuests(c *gin.Context) {
	// Log that we reached this endpoint
	fmt.Printf("DeleteSelectedGuests endpoint called\n")
	
	var req DeleteSelectedGuestsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Attempting to delete %d guests: %v\n", len(req.GuestIDs), req.GuestIDs)

	err := h.service.DeleteSelectedGuests(req.GuestIDs)
	if err != nil {
		fmt.Printf("Service error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Successfully deleted %d guests\n", len(req.GuestIDs))
	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("%d guests deleted successfully", len(req.GuestIDs)),
		"count":   len(req.GuestIDs),
	})
}