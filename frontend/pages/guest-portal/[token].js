import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { apiClient } from '../../lib/api';
import PhotoUpload from '../../components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, MessageCircle, User, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function GuestPortal() {
  const router = useRouter();
  const { token } = router.query;
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    if (token) {
      fetchGuestData();
    }
  }, [token]);

  const fetchGuestData = async () => {
    try {
      const response = await apiClient.get(`/api/guest-portal/${token}`);
      setGuestData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Invalid or expired guest portal link');
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSendingMessage(true);
    try {
      // For now, we'll use a simple API call. In a real implementation, 
      // you might want to create a messages table/service
      await apiClient.post('/api/messages', {
        guestToken: token,
        message: message.trim(),
        guestName: `${guestData.firstName} ${guestData.lastName}`
      });
      
      setMessage('');
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Guest Portal - Error</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">{error}</p>
            </div>
            <a 
              href="/"
              className="inline-block bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition-colors"
            >
              Back to Wedding Website
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{guestData ? `Wedding Portal - ${guestData.firstName} ${guestData.lastName}` : 'Wedding Portal'}</title>
      </Head>

      <div className="min-h-screen bg-background">
        <div className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif text-foreground">
                    Welcome, {guestData?.firstName}!
                  </h1>
                  <p className="text-muted-foreground">Your personal wedding portal</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <a href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wedding Site
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <Button
                  variant={activeTab === 'upload' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('upload')}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-auto px-6 py-4"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Share Photos
                </Button>
                <Button
                  variant={activeTab === 'message' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('message')}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-auto px-6 py-4"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'upload' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Share Your Photos</h2>
                    <p className="text-gray-600">
                      Upload your favorite photos from the wedding! The couple will love to see your perspective of their special day.
                    </p>
                  </div>
                  
                  <PhotoUpload 
                    guestToken={token}
                    guestName={`${guestData?.firstName} ${guestData?.lastName}`}
                  />
                </div>
              )}

              {activeTab === 'message' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send a Message</h2>
                    <p className="text-muted-foreground">
                      Share your thoughts, congratulations, or any special memories from the wedding with the couple.
                    </p>
                  </div>

                  {messageSent && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-green-700 font-medium">Your message has been sent to the couple!</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <form onSubmit={sendMessage} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Your Message
                      </label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="Dear Sarah & Michael, what a beautiful wedding! I wanted to share..."
                        className="resize-none"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={sendingMessage || !message.trim()}
                      size="lg"
                      className="w-full"
                    >
                      {sendingMessage ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </Card>

          <Card className="mt-8 border-blue-200 bg-blue-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-900">About This Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>This is your personal space to share photos and messages with the couple</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Photos you upload will be reviewed before being added to the public gallery</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Messages are sent directly to the couple and won't be public</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Keep this link private - it's unique to you!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}