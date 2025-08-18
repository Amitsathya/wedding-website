package rsvp

import (
	"fmt"
	"net/http"

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

func (h *Handler) GetRSVP(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	guest, err := h.service.GetGuestByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid RSVP link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"firstName":                   guest.FirstName,
		"lastName":                    guest.LastName,
		"maxPartySize":                guest.MaxPartySize,
		"hasRSVP":                     guest.RSVPStatus != "pending",
		"partySize":                   guest.PartySize,
		"partyMembers":                guest.PartyMembers,
		"mainPersonDietaryPreference": guest.MainPersonDietaryPreference,
		"dec24Attendance":             guest.Dec24Attendance,
		"dec25Attendance":             guest.Dec25Attendance,
		"accommodationDec23":          guest.AccommodationDec23,
		"accommodationDec24":          guest.AccommodationDec24,
		"accommodationDec25":          guest.AccommodationDec25,
		"concerns":                    guest.Concerns,
	})
}

type SubmitRSVPRequest struct {
	Response        string                `json:"response" binding:"required,oneof=yes no"`
	Message         string                `json:"message"`
	UpdatedDetails  *UpdatedDetailsStruct `json:"updatedDetails"`
}

type UpdatedDetailsStruct struct {
	PartySize                   int                        `json:"partySize"`
	PartyMembers                interface{}                `json:"partyMembers"` // Keep as interface{} for JSONB compatibility
	MainPersonDietaryPreference string                     `json:"mainPersonDietaryPreference"`
	Dec24Attendance             bool                       `json:"dec24Attendance"`
	Dec25Attendance             bool                       `json:"dec25Attendance"`
	AccommodationDec23          bool                       `json:"accommodationDec23"`
	AccommodationDec24          bool                       `json:"accommodationDec24"`
	AccommodationDec25          bool                       `json:"accommodationDec25"`
	Concerns                    string                     `json:"concerns"`
}

func (h *Handler) SubmitRSVP(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	var req SubmitRSVPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("Received RSVP request: %+v\n", req)
	fmt.Printf("Updated details: %+v\n", req.UpdatedDetails)

	err := h.service.SubmitRSVP(token, req.Response, req.Message, req.UpdatedDetails)
	if err != nil {
		fmt.Printf("Service error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "RSVP submitted successfully"})
}

func (h *Handler) GetRSVPs(c *gin.Context) {
	rsvps, stats, err := h.service.GetAllRSVPs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch RSVPs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"rsvps": rsvps,
		"stats": stats,
	})
}

func (h *Handler) ExportRSVPs(c *gin.Context) {
	csvData, err := h.service.ExportRSVPsToCSV()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export RSVPs"})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=rsvps.csv")
	c.String(http.StatusOK, csvData)
}