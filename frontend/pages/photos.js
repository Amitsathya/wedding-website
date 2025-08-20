import Head from 'next/head';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Camera, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PhotoUpload from '../components/PhotoUpload';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await apiClient.get('/api/photos');
      setPhotos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const handlePhotoUploaded = (newPhoto) => {
    // Refresh the photos list after successful upload
    fetchPhotos();
  };

  return (
    <>
      <Head>
        <title>Photos - Wedding Gallery</title>
        <meta name="description" content="Share your photos from our special day" />
      </Head>

      <main className="min-h-screen relative overflow-hidden">
        {/* Continuous background with seamless gradients */}
        <div className="absolute inset-0 bg-background">
          {/* Flowing gradient background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/3"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-t from-primary/3 via-transparent to-transparent"></div>
        </div>

        {/* Header Section */}
        <div className="py-12 sm:py-16 px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-3 sm:mx-6"></div>
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent mx-3 sm:mx-6"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4 sm:mb-6 text-shadow px-2">
                Photo Gallery
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed px-4">
                Beautiful moments from our wedding day, captured and shared by our loved ones
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="pb-8 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground mb-4">
                Share Your Photos
              </h2>
              <p className="text-muted-foreground">
                Help us capture every moment by sharing your photos from our special day
              </p>
            </div>
            <PhotoUpload
              onPhotoUploaded={handlePhotoUploaded}
              guestToken="anonymous"
              guestName="Guest"
            />
          </div>
        </div>

        {/* Gallery Section */}
        <div className="pb-12 sm:pb-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-lg sm:text-xl text-muted-foreground font-light">
                  Loading photos...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {photos.map((photo) => (
                  <Card
                    key={photo.id}
                    className="overflow-hidden hover-lift gradient-card animate-scale-in"
                    style={{ animationDelay: `${Math.random() * 0.5}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="relative group">
                        <img
                          src={photo.thumbnailUrl}
                          alt="Wedding photo"
                          className="w-full h-48 sm:h-56 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() => window.open(photo.fullUrl, '_blank')}
                          onError={(e) => {
                            // Fallback to a placeholder if image fails to load
                            e.target.src =
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                            e.target.onclick = null; // Remove click handler for placeholder
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Image className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-foreground font-medium">
                          by {photo.uploadedBy || 'Guest'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(photo.uploadedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && photos.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-foreground mb-3 sm:mb-4 px-2">
                  No Photos Yet
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
                  No photos have been shared yet. Check back soon to see beautiful moments from our
                  special day!
                </p>
              </div>
            )}
          </div>{' '}
          {/* Back to Home */}
          <div className="text-center pt-6 sm:pt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="/" className="text-sm sm:text-base">
                Return Home
              </a>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
