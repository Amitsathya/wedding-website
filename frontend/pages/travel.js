import Head from 'next/head';
import { Plane, Car, Hotel, Clock, MapPin, Sun, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Travel() {
  return (
    <>
      <Head>
        <title>Travel & Accommodations - Wedding Information</title>
        <meta name="description" content="Travel information and hotel recommendations for our wedding" />
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
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-6 sm:mb-8">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-3 sm:mx-6"></div>
                <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent mx-3 sm:mx-6"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4 sm:mb-6 text-shadow px-2">
                Travel & Accommodations
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed px-4">
                Everything you need to know for your trip to join our celebration in Thrissur, Kerala
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pb-12 sm:pb-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Getting There */}
            <Card className="gradient-card hover-lift animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl font-serif">
                  <Plane className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Getting There
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1" />
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">By Air</h3>
                        <div className="space-y-3">
                          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                            <p className="font-semibold text-foreground text-sm sm:text-base">Cochin International Airport (COK)</p>
                            <p className="text-muted-foreground text-sm">1 hour drive to Thrissur</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Major airlines, rental cars available</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                            <p className="font-semibold text-foreground text-sm sm:text-base">Coimbatore Airport (CJB)</p>
                            <p className="text-muted-foreground text-sm">2.5 hours drive to Thrissur</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Alternative option with connecting flights</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1" />
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">By Road</h3>
                        <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
                          <p><span className="font-medium">From Kochi:</span> 1 hour via NH 544</p>
                          <p><span className="font-medium">From Bangalore:</span> 6 hours via NH 44</p>
                          <p><span className="font-medium">From Chennai:</span> 7 hours via NH 44</p>
                          <p><span className="font-medium">Parking:</span> Available at both venues</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotels */}
            <Card className="gradient-card hover-lift animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl font-serif">
                  <Hotel className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Recommended Hotels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="border-l-4 border-primary pl-4 sm:pl-6 bg-primary/5 rounded-r-lg p-3 sm:p-4">
                  <div className="flex items-start sm:items-center mb-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Thottam & Palazzo Chakolas</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">Venue Hotels • ₹8,000-12,000/night</p>
                  <p className="text-xs sm:text-sm text-primary font-semibold mb-2">Book by November 1st for group rate</p>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <a href="tel:+914872421122" className="flex items-center text-xs sm:text-sm">
                      Call: +91 487 242 1122 • Group Code: BHARAT-DIVYA
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-secondary pl-4 sm:pl-6 bg-secondary/10 rounded-r-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Casino Hotel</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">5 minutes from venue • ₹6,000-9,000/night</p>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a href="https://casinohotelkochi.com" target="_blank" className="text-xs sm:text-sm">
                      Book Online
                    </a>
                  </Button>
                </div>

                <div className="border-l-4 border-accent pl-4 sm:pl-6 bg-accent/10 rounded-r-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Budget Option: Hotel Elite International</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">10 minutes from venue • ₹3,000-5,000/night</p>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a href="https://hoteleliteinternational.com" target="_blank" className="text-xs sm:text-sm">
                      Book Online
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card className="gradient-card hover-lift animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl font-serif">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1" />
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Shuttle Service</h3>
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                          <p className="text-muted-foreground text-sm sm:text-base">We'll provide shuttles from main hotels to venues</p>
                          <p className="text-xs sm:text-sm"><span className="font-medium">Pickup times:</span> 3:00 PM</p>
                          <p className="text-xs sm:text-sm"><span className="font-medium">Return shuttles:</span> 10:00 PM & 12:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1" />
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Local Transport</h3>
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
                          <p className="text-muted-foreground text-sm sm:text-base">Uber, Ola, and local taxis available</p>
                          <p className="text-xs sm:text-sm"><span className="font-medium">Estimated cost:</span> ₹200-500 from hotels</p>
                          <p className="text-xs sm:text-sm"><span className="font-medium">Auto-rickshaws:</span> ₹100-300</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Things to Do */}
            <Card className="gradient-card hover-lift animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl font-serif">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Things to Do in Thrissur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Cultural Attractions</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Vadakkunnathan Temple</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Kerala Kalamandalam</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Thrissur Zoo & Museum</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Shakthan Thampuran Palace</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Nearby Attractions</h3>
                    <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Athirapally Waterfalls (1 hour)</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Guruvayur Temple (30 min)</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Cherai Beach (45 min)</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>Kochi Fort & Chinese Nets (1 hour)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather */}
            <Card className="gradient-card hover-lift animate-scale-in" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl sm:text-2xl font-serif">
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Weather & Dress Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Expected Weather in December</h3>
                  </div>
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                    <span className="font-medium">Temperature:</span> 24-32°C (75-90°F) during the day, 20-24°C (68-75°F) in the evening
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    <span className="font-medium">Humidity:</span> Moderate to high • <span className="font-medium">Rain:</span> Minimal chance
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-4 sm:p-6 border border-primary/20">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Dress Code</h3>
                  <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
                    <p><span className="font-medium">Ceremony:</span> Traditional Indian attire recommended (we can help arrange rentals)</p>
                    <p><span className="font-medium">Reception:</span> Cocktail attire or traditional wear</p>
                    <p><span className="font-medium">Footwear:</span> Comfortable shoes recommended for outdoor areas</p>
                    <p><span className="font-medium">Evening:</span> Light shawl or jacket for air-conditioned areas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back to Home */}
            <div className="text-center pt-6 sm:pt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="/" className="text-sm sm:text-base">
                  Return Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}