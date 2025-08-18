import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import RsvpForm from '../../components/RsvpForm';
import { apiClient } from '../../lib/api';

export default function RsvpPage() {
  const router = useRouter();
  const { token } = router.query;
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchGuestData();
    }
  }, [token]);

  const fetchGuestData = async () => {
    try {
      const response = await apiClient.get(`/api/rsvp/${token}`);
      setGuestData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Invalid RSVP link or expired token');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your RSVP...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">RSVP Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>RSVP - Sarah & Michael</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif mb-2">RSVP</h1>
            <p className="text-lg text-gray-600">
              Hello {guestData?.firstName} {guestData?.lastName}!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please respond by May 1st, 2024
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <RsvpForm 
              token={token}
              guestData={guestData}
              onSubmitSuccess={() => {
                router.push('/rsvp/confirmation');
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}