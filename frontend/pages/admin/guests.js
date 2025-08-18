import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';

export default function AdminGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuests, setSelectedGuests] = useState(new Set());
  const [expandedGuests, setExpandedGuests] = useState(new Set());

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await apiClient.get('/api/guests');
      // Filter to only show approved guests
      const approvedGuests = response.data.filter(guest => guest.registrationStatus === 'approved');
      setGuests(approvedGuests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setLoading(false);
    }
  };

  const handleSelectGuest = (guestId, checked) => {
    setSelectedGuests(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(guestId);
      } else {
        newSet.delete(guestId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedGuests(new Set(guests.map(guest => guest.id)));
    } else {
      setSelectedGuests(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGuests.size === 0) {
      alert('Please select guests to delete');
      return;
    }

    const confirmMessage = `⚠️ Are you sure you want to delete ${selectedGuests.size} selected guest(s)?

This will permanently delete:
• Selected guest registrations
• Their RSVPs and responses
• Their messages
• Their uploaded photos

This action CANNOT be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await apiClient.post('/api/guests/delete-selected', {
        guestIds: Array.from(selectedGuests)
      });
      alert(`${selectedGuests.size} guests deleted successfully`);
      setSelectedGuests(new Set());
      fetchGuests(); // Refresh the list
    } catch (error) {
      alert('Error deleting guests: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleExpandedGuest = (guestId) => {
    setExpandedGuests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) {
        newSet.delete(guestId);
      } else {
        newSet.add(guestId);
      }
      return newSet;
    });
  };

  const getStatusColor = (rsvpStatus) => {
    switch (rsvpStatus) {
      case 'yes': return 'bg-green-100 text-green-800';
      case 'no': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = {
    total: guests.length,
    rsvpYes: guests.filter(g => g.rsvpStatus === 'yes').length,
    rsvpNo: guests.filter(g => g.rsvpStatus === 'no').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    totalAttending: guests.reduce((sum, g) => sum + (g.rsvpStatus === 'yes' ? g.partySize || 1 : 0), 0)
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>Approved Guests - Admin</title>
        </Head>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Approved Guests</h1>
            <div className="flex space-x-3">
              <button
                onClick={fetchGuests}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
              {selectedGuests.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete Selected ({selectedGuests.size})
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Guests</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.rsvpYes}</div>
              <div className="text-sm text-gray-600">RSVP Yes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rsvpNo}</div>
              <div className="text-sm text-gray-600">RSVP No</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttending}</div>
              <div className="text-sm text-gray-600">Total Attending</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Guest List ({guests.length} approved guests)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                These guests have been approved and can access their RSVP and portal links.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">Loading guests...</div>
            ) : guests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <p>No approved guests yet</p>
                <p className="text-sm mt-1">Guests will appear here after approval in the registrations page.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedGuests.size === guests.length && guests.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        RSVP Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Party Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Approved
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Links
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {guests.map((guest) => (
                      <React.Fragment key={guest.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedGuests.has(guest.id)}
                              onChange={(e) => handleSelectGuest(guest.id, e.target.checked)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              {guest.email && <div>{guest.email}</div>}
                              {guest.phone && <div className="text-gray-500">{guest.phone}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(guest.rsvpStatus)}`}>
                              {guest.rsvpStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {guest.rsvpStatus === 'yes' ? (guest.partySize || 1) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleExpandedGuest(guest.id)}
                              className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                              {expandedGuests.has(guest.id) ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                  </svg>
                                  Hide
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                  View
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {guest.approvedAt ? 
                              new Date(guest.approvedAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2 text-sm">
                              {guest.inviteToken && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rsvp/${guest.inviteToken}`)}
                                  className="text-blue-600 hover:underline"
                                  title="Copy RSVP link"
                                >
                                  RSVP
                                </button>
                              )}
                              {guest.guestPortalToken && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/guest-portal/${guest.guestPortalToken}`)}
                                  className="text-green-600 hover:underline"
                                  title="Copy portal link"
                                >
                                  Portal
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Questionnaire Details */}
                        {expandedGuests.has(guest.id) && (
                          <tr key={`${guest.id}-details`} className="bg-gray-50">
                            <td colSpan="8" className="px-4 py-4">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">RSVP Details</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  {/* Main Person Dietary Preference */}
                                  {guest.mainPersonDietaryPreference && (
                                    <div>
                                      <span className="font-medium text-gray-700">Main Person Dietary:</span>
                                      <div className="mt-1 text-gray-600">
                                        {guest.firstName} {guest.lastName}: {guest.mainPersonDietaryPreference}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Party Members with Dietary Preferences */}
                                  {guest.partyMembers && guest.partyMembers.length > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700">Additional Party Members:</span>
                                      <div className="mt-1">
                                        {guest.partyMembers.map((member, index) => (
                                          <div key={index} className="text-gray-600 mb-1">
                                            {member.firstName} {member.lastName}
                                            {member.dietaryPreference && (
                                              <span className="text-sm text-gray-500 ml-2">
                                                ({member.dietaryPreference})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Event Attendance */}
                                  <div>
                                    <span className="font-medium text-gray-700">Event Attendance:</span>
                                    <div className="mt-1 space-y-1">
                                      <div>
                                        <span className="text-sm font-medium">Dec 24 (Raaga Riti):</span>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                          guest.dec24Attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {guest.dec24Attendance ? 'Attending' : 'Not Attending'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Dec 25 (Wedding):</span>
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                          guest.dec25Attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {guest.dec25Attendance ? 'Attending' : 'Not Attending'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Accommodation */}
                                  <div>
                                    <span className="font-medium text-gray-700">Accommodation:</span>
                                    <div className="mt-1">
                                      {(guest.accommodationDec23 || guest.accommodationDec24 || guest.accommodationDec25) ? (
                                        <div className="space-y-1">
                                          {guest.accommodationDec23 && (
                                            <div className="text-sm text-green-600">✓ Dec 23rd</div>
                                          )}
                                          {guest.accommodationDec24 && (
                                            <div className="text-sm text-green-600">✓ Dec 24th</div>
                                          )}
                                          {guest.accommodationDec25 && (
                                            <div className="text-sm text-green-600">✓ Dec 25th</div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-500">No accommodation needed</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Concerns */}
                                  {guest.concerns && (
                                    <div className="md:col-span-2 lg:col-span-3">
                                      <span className="font-medium text-gray-700">Special Requests/Concerns:</span>
                                      <div className="mt-1 text-gray-600 bg-gray-100 p-2 rounded text-sm">
                                        {guest.concerns}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Guest Management</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This page shows only approved guests who can RSVP and access their portal</li>
              <li>• Use the "Registrations" tab to approve new guest registrations</li>
              <li>• Click RSVP/Portal links to copy them to clipboard</li>
              <li>• Stats are updated in real-time based on guest responses</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}