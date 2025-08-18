import Head from 'next/head';
import Link from 'next/link';

export default function RsvpConfirmation() {
  return (
    <>
      <Head>
        <title>RSVP Confirmed - Sarah & Michael</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="text-3xl font-serif mb-4 text-green-600">
              RSVP Confirmed!
            </h1>
            <p className="text-lg mb-6">
              Thank you for your response. We can't wait to celebrate with you!
            </p>
            
            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-gray-600 mb-4">
                You should receive a confirmation email shortly. 
                Need to make changes? Contact us directly.
              </p>
              <Link 
                href="/" 
                className="inline-block bg-rose-600 text-white px-6 py-2 rounded-md hover:bg-rose-700 transition-colors"
              >
                Back to Wedding Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}