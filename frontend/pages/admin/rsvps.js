import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';
import React from 'react';

export default function AdminRsvps() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRsvps, setExpandedRsvps] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    yes: 0,
    no: 0,
    pending: 0,
    totalAttending: 0
  });

  const toggleExpandedRsvp = (id) => {
    const newExpanded = new Set(expandedRsvps);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRsvps(newExpanded);
  };

  useEffect(() => {
    fetchRsvps();
  }, []);

  const fetchRsvps = async () => {
    try {
      const response = await apiClient.get('/api/rsvps');
      console.log('RSVP API response:', response.data);
      
      // Handle different response structures
      let rsvpData = [];
      if (Array.isArray(response.data)) {
        rsvpData = response.data;
      } else if (response.data && Array.isArray(response.data.rsvps)) {
        rsvpData = response.data.rsvps;
      } else if (response.data && Array.isArray(response.data.data)) {
        rsvpData = response.data.data;
      }
      
      setRsvps(rsvpData);
      setStats(response.data.stats || {
        total: 0,
        yes: 0,
        no: 0,
        pending: 0,
        totalAttending: 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      setRsvps([]);
      setLoading(false);
    }
  };

  const exportRsvps = async () => {
    try {
      const response = await apiClient.get('/api/rsvps/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rsvps.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error exporting RSVPs');
    }
  };

  const sendReminders = async () => {
    try {
      await apiClient.post('/api/reminders/send');
      alert('Reminders sent to pending guests!');
    } catch (error) {
      alert('Error sending reminders');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>RSVP Management - Admin</title>
        </Head>

        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">RSVP Management</h1>
          <div className="flex space-x-4">
            <button
              onClick={sendReminders}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Send Reminders
            </button>
            <button
              onClick={exportRsvps}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Invited</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">{stats.yes}</div>
            <div className="text-sm text-gray-500">Attending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-red-600">{stats.no}</div>
            <div className="text-sm text-gray-500">Not Attending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAttending}</div>
            <div className="text-sm text-gray-500">Total Guests</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent RSVPs</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading RSVPs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Guest
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Response
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Party Size
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Responded At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(rsvps) ? rsvps.map((rsvp) => (
                    <React.Fragment key={rsvp.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {rsvp.guest.firstName} {rsvp.guest.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rsvp.response === 'yes' ? 'bg-green-100 text-green-800' :
                            rsvp.response === 'no' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rsvp.response}
                          </span>
                        </td>
                        <td className="px-4 py-3">{rsvp.partySize}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpandedRsvp(rsvp.id)}
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            {expandedRsvps.has(rsvp.id) ? (
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
                        <td className="px-4 py-3">
                          {new Date(rsvp.respondedAt).toLocaleDateString()}
                        </td>
                      </tr>
                      
                      {/* Expanded Questionnaire Details */}
                      {expandedRsvps.has(rsvp.id) && (
                        <tr key={`${rsvp.id}-details`} className="bg-gray-50">
                          <td colSpan="5" className="px-4 py-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3">RSVP Details</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                {/* Main Person Dietary Preference */}
                                {rsvp.guest.mainPersonDietaryPreference && (
                                  <div>
                                    <span className="font-medium text-gray-700">Main Person Dietary:</span>
                                    <div className="mt-1 text-gray-600">
                                      {rsvp.guest.firstName} {rsvp.guest.lastName}: {rsvp.guest.mainPersonDietaryPreference}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Party Members with Dietary Preferences */}
                                {rsvp.guest.partyMembers && rsvp.guest.partyMembers.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700">Additional Party Members:</span>
                                    <div className="mt-1">
                                      {rsvp.guest.partyMembers.map((member, index) => (
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
                                        rsvp.guest.dec24Attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {rsvp.guest.dec24Attendance ? 'Attending' : 'Not Attending'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">Dec 25 (Wedding):</span>
                                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        rsvp.guest.dec25Attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {rsvp.guest.dec25Attendance ? 'Attending' : 'Not Attending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Accommodation */}
                                <div>
                                  <span className="font-medium text-gray-700">Accommodation:</span>
                                  <div className="mt-1">
                                    {(rsvp.guest.accommodationDec23 || rsvp.guest.accommodationDec24 || rsvp.guest.accommodationDec25) ? (
                                      <div className="space-y-1">
                                        {rsvp.guest.accommodationDec23 && (
                                          <div className="text-sm text-green-600">✓ Dec 23rd</div>
                                        )}
                                        {rsvp.guest.accommodationDec24 && (
                                          <div className="text-sm text-green-600">✓ Dec 24th</div>
                                        )}
                                        {rsvp.guest.accommodationDec25 && (
                                          <div className="text-sm text-green-600">✓ Dec 25th</div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">No accommodation needed</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Message */}
                                {rsvp.message && (
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <span className="font-medium text-gray-700">Message from Guest:</span>
                                    <div className="mt-1 text-gray-600 bg-gray-100 p-2 rounded text-sm">
                                      {rsvp.message}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Concerns */}
                                {rsvp.guest.concerns && (
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <span className="font-medium text-gray-700">Special Requests/Concerns:</span>
                                    <div className="mt-1 text-gray-600 bg-gray-100 p-2 rounded text-sm">
                                      {rsvp.guest.concerns}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No RSVPs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}