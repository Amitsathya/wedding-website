import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Check, X, Trash2, Users, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminRegistrations() {
  const [pendingGuests, setPendingGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [selectedGuests, setSelectedGuests] = useState(new Set());

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await apiClient.get('/api/guests/pending');
      setPendingGuests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
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
      setSelectedGuests(new Set(pendingGuests.map(guest => guest.id)));
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
      console.log('Attempting to delete guests:', Array.from(selectedGuests));
      console.log('API URL:', '/api/guests/delete-selected');
      
      const response = await apiClient.post('/api/guests/delete-selected', {
        guestIds: Array.from(selectedGuests)
      });
      
      console.log('Delete response:', response.data);
      alert(`${selectedGuests.size} guests deleted successfully`);
      setSelectedGuests(new Set());
      fetchPendingRegistrations(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response);
      alert('Error deleting guests: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleApprove = async (guestId) => {
    setProcessingIds(prev => new Set(prev).add(guestId));
    
    try {
      await apiClient.post(`/api/guests/${guestId}/approve`);
      
      alert('Guest registration approved! Notification sent.');
      fetchPendingRegistrations();
    } catch (error) {
      alert('Error approving registration: ' + error.response?.data?.message);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(guestId);
        return newSet;
      });
    }
  };

  const handleReject = async (guestId) => {
    if (!confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    setProcessingIds(prev => new Set(prev).add(guestId));
    
    try {
      await apiClient.post(`/api/guests/${guestId}/reject`);
      alert('Guest registration rejected.');
      fetchPendingRegistrations();
    } catch (error) {
      alert('Error rejecting registration: ' + error.response?.data?.message);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(guestId);
        return newSet;
      });
    }
  };


  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>Guest Registrations - Admin</title>
        </Head>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guest Registrations</h1>
              <p className="text-muted-foreground mt-2">
                Review and approve guest registrations for your wedding
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={fetchPendingRegistrations}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {selectedGuests.size > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedGuests.size})
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Pending Registrations ({pendingGuests.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve guest registrations. Once approved, guests will receive an email/SMS with their personalized RSVP link.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">Loading registrations...</div>
            ) : pendingGuests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p>No pending registrations</p>
                <p className="text-sm mt-1">Share the registration link: <code className="bg-gray-100 px-2 py-1 rounded">/register</code></p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedGuests.size === pendingGuests.length && pendingGuests.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Contact Information
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Registered At
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
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
                            <div className="font-medium">{guest.email}</div>
                            {guest.phone && <div className="text-gray-500">{guest.phone}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(guest.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            {guest.registrationStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(guest.id)}
                              disabled={processingIds.has(guest.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              {processingIds.has(guest.id) ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(guest.id)}
                              disabled={processingIds.has(guest.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Registration Process</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Guests visit <code className="bg-blue-100 px-1 rounded">/register</code> and submit their name</li>
              <li>2. Registration appears here for admin approval</li>
              <li>3. Admin approves with email/phone and guest receives personalized RSVP link</li>
              <li>4. Guest uses RSVP link to complete their wedding RSVP</li>
              <li>5. After RSVP approval, guest gets access to photo sharing portal</li>
            </ol>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}