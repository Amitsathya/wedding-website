import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export default function RsvpForm({ token, guestData, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    response: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingDetails, setEditingDetails] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({
    partySize: 1,
    partyMembers: [],
    mainPersonDietaryPreference: '',
    dec24Attendance: false,
    dec25Attendance: false,
    accommodationDec23: false,
    accommodationDec24: false,
    accommodationDec25: false,
    concerns: ''
  });

  // Initialize updatedDetails when guestData is available
  useEffect(() => {
    if (guestData) {
      console.log('Guest data received:', guestData);
      setUpdatedDetails({
        partySize: guestData.partySize || 1,
        partyMembers: Array.isArray(guestData.partyMembers) ? guestData.partyMembers : [],
        mainPersonDietaryPreference: guestData.mainPersonDietaryPreference || '',
        dec24Attendance: guestData.dec24Attendance || false,
        dec25Attendance: guestData.dec25Attendance || false,
        accommodationDec23: guestData.accommodationDec23 || false,
        accommodationDec24: guestData.accommodationDec24 || false,
        accommodationDec25: guestData.accommodationDec25 || false,
        concerns: guestData.concerns || ''
      });
    }
  }, [guestData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.response) {
      setError('Please select your RSVP response');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const submissionData = {
        ...formData,
        ...(editingDetails ? { updatedDetails } : {})
      };
      console.log('Submitting RSVP data:', submissionData);
      const response = await apiClient.post(`/api/rsvp/${token}/submit`, submissionData);
      console.log('RSVP submission successful:', response.data);
      onSubmitSuccess();
    } catch (err) {
      console.error('RSVP submission error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit RSVP');
      setSubmitting(false);
    }
  };

  const handleDetailChange = (field, value) => {
    setUpdatedDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePartyMemberChange = (index, field, value) => {
    setUpdatedDetails(prev => {
      const newMembers = [...prev.partyMembers];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return { ...prev, partyMembers: newMembers };
    });
  };

  const handlePartySizeChange = (size) => {
    const newSize = parseInt(size);
    setUpdatedDetails(prev => {
      const newMembers = [...prev.partyMembers];
      if (newSize > prev.partySize) {
        // Add new members
        for (let i = prev.partySize; i < newSize; i++) {
          newMembers.push({
            firstName: '',
            lastName: '',
            dietaryPreference: '',
          });
        }
      } else if (newSize < prev.partySize) {
        // Remove excess members
        newMembers.splice(newSize - 1);
      }
      return {
        ...prev,
        partySize: newSize,
        partyMembers: newMembers,
      };
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Show Registration Details */}
      {guestData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Your Registration Details</h3>
            <button
              type="button"
              onClick={() => setEditingDetails(!editingDetails)}
              className="text-sm text-blue-600 hover:underline"
            >
              {editingDetails ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>
          
          {!editingDetails ? (
            <div className="text-sm space-y-2">
              <div><span className="font-medium">Party Size:</span> {guestData.partySize || 1} {guestData.partySize === 1 ? 'person' : 'people'}</div>
              
              {guestData.partyMembers && guestData.partyMembers.length > 0 && (
                <div>
                  <span className="font-medium">Party Members:</span>
                  <ul className="ml-4 mt-1">
                    {guestData.partyMembers.map((member, index) => (
                      <li key={index}>
                        {member.firstName} {member.lastName}
                        {member.dietaryPreference && <span className="text-gray-600"> ({member.dietaryPreference})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {guestData.mainPersonDietaryPreference && (
                <div><span className="font-medium">Your Dietary Preference:</span> {guestData.mainPersonDietaryPreference}</div>
              )}
              
              <div className="space-y-1">
                <div className="font-medium">Event Attendance:</div>
                <div className="ml-4">
                  <div>Dec 24 (Raaga Riti): {guestData.dec24Attendance ? '✓ Attending' : '✗ Not Attending'}</div>
                  <div>Dec 25 (Wedding): {guestData.dec25Attendance ? '✓ Attending' : '✗ Not Attending'}</div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Accommodation Needed:</span>
                <div className="ml-4">
                  {(guestData.accommodationDec23 || guestData.accommodationDec24 || guestData.accommodationDec25) ? (
                    <>
                      {guestData.accommodationDec23 && <div>✓ Dec 23rd</div>}
                      {guestData.accommodationDec24 && <div>✓ Dec 24th</div>}
                      {guestData.accommodationDec25 && <div>✓ Dec 25th</div>}
                    </>
                  ) : (
                    <div className="text-gray-500">No accommodation needed</div>
                  )}
                </div>
              </div>
              
              {guestData.concerns && (
                <div>
                  <span className="font-medium">Special Requests:</span>
                  <div className="ml-4 text-gray-600 bg-white p-2 rounded text-sm mt-1">{guestData.concerns}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Editing interface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={updatedDetails.partySize}
                  onChange={(e) => handlePartySizeChange(e.target.value)}
                  className="w-24 border border-gray-300 rounded-md px-3 py-1"
                />
              </div>

              {/* Main Person Dietary Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Dietary Preference</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="updatedMainDietary"
                      value="veg"
                      checked={updatedDetails.mainPersonDietaryPreference === 'veg'}
                      onChange={(e) => handleDetailChange('mainPersonDietaryPreference', e.target.value)}
                      className="mr-2"
                    />
                    Veg
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="updatedMainDietary"
                      value="non-veg"
                      checked={updatedDetails.mainPersonDietaryPreference === 'non-veg'}
                      onChange={(e) => handleDetailChange('mainPersonDietaryPreference', e.target.value)}
                      className="mr-2"
                    />
                    Non Veg
                  </label>
                </div>
              </div>

              {/* Party Members */}
              {updatedDetails.partySize > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Party Members</label>
                  {updatedDetails.partyMembers.map((member, index) => (
                    <div key={index} className="border rounded p-3 mb-2 bg-white">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={member.firstName}
                          onChange={(e) => handlePartyMemberChange(index, 'firstName', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={member.lastName}
                          onChange={(e) => handlePartyMemberChange(index, 'lastName', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`member-${index}-dietary-updated`}
                            value="veg"
                            checked={member.dietaryPreference === 'veg'}
                            onChange={(e) => handlePartyMemberChange(index, 'dietaryPreference', e.target.value)}
                            className="mr-1"
                          />
                          <span className="text-sm">Veg</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`member-${index}-dietary-updated`}
                            value="non-veg"
                            checked={member.dietaryPreference === 'non-veg'}
                            onChange={(e) => handlePartyMemberChange(index, 'dietaryPreference', e.target.value)}
                            className="mr-1"
                          />
                          <span className="text-sm">Non Veg</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Event Attendance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Attendance</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedDetails.dec24Attendance}
                      onChange={(e) => handleDetailChange('dec24Attendance', e.target.checked)}
                      className="mr-2"
                    />
                    Dec 24 (Raaga Riti)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedDetails.dec25Attendance}
                      onChange={(e) => handleDetailChange('dec25Attendance', e.target.checked)}
                      className="mr-2"
                    />
                    Dec 25 (Wedding)
                  </label>
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Needed</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedDetails.accommodationDec23}
                      onChange={(e) => handleDetailChange('accommodationDec23', e.target.checked)}
                      className="mr-2"
                    />
                    Dec 23rd
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedDetails.accommodationDec24}
                      onChange={(e) => handleDetailChange('accommodationDec24', e.target.checked)}
                      className="mr-2"
                    />
                    Dec 24th
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatedDetails.accommodationDec25}
                      onChange={(e) => handleDetailChange('accommodationDec25', e.target.checked)}
                      className="mr-2"
                    />
                    Dec 25th
                  </label>
                </div>
              </div>

              {/* Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests/Concerns</label>
                <textarea
                  value={updatedDetails.concerns}
                  onChange={(e) => handleDetailChange('concerns', e.target.value)}
                  placeholder="Any special requests, dietary restrictions, or concerns..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          
          {!editingDetails && (
            <p className="text-xs text-gray-500 mt-3">
              Click "Edit Details" above to update any information.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Final RSVP Confirmation
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="response"
                value="yes"
                checked={formData.response === 'yes'}
                onChange={(e) => handleInputChange('response', e.target.value)}
                className="mr-3"
              />
              <span className="text-lg">Yes, I confirm my attendance! 🎉</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="response"
                value="no"
                checked={formData.response === 'no'}
                onChange={(e) => handleInputChange('response', e.target.value)}
                className="mr-3"
              />
              <span className="text-lg">Sorry, I can't make it 😔</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message for the Happy Couple (Optional)
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Share your excitement, well wishes, or any last-minute updates..."
            rows="4"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rose-600 text-white py-3 px-4 rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
        >
          {submitting ? 'Submitting RSVP...' : 'Submit Final RSVP'}
        </button>
      </form>
    </div>
  );
}