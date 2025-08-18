import { useState } from 'react';
import Head from 'next/head';
import { apiClient } from '../lib/api';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide both first and last name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please provide a valid email address');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.post('/api/guests/register', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <>
        <Head>
          <title>Registration Submitted - Wedding RSVP</title>
        </Head>
        
        <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif text-gray-900 mb-2 px-2">Registration Submitted!</h1>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                Thank you for registering, {formData.firstName}! Your request has been submitted and is pending approval.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">What happens next?</h3>
              <p className="text-blue-800 text-xs sm:text-sm">
                The couple will review your registration and send you a personalized RSVP link via email or SMS once approved.
              </p>
            </div>
            
            <a 
              href="/"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Back to Wedding Website
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>RSVP Registration - Wedding</title>
        <meta name="description" content="Register for wedding RSVP" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-2 px-2">Wedding RSVP</h1>
            <p className="text-gray-600 text-sm sm:text-base px-2">
              Please register to receive your personalized RSVP invitation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Enter your last name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 text-white py-3 sm:py-4 px-4 rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
            >
              {submitting ? 'Submitting...' : 'Register for RSVP'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 px-2">
              After registration, you'll receive a personalized link to complete your RSVP
            </p>
          </div>
        </div>
      </main>
    </>
  );
}