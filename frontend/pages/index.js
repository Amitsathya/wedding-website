import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MapPin, Calendar, Users, Camera, Plane, Check, Mail, Phone, User } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [weddingData, setWeddingData] = useState({
    bride: 'Bharat',
    groom: 'Divya',
    date: 'December 24-25, 2025',
    venue: ['Thottam', 'Palazzo Chakolas'],
    location: 'Thrissur, Kerala',
  });

  const pathRef = useRef(null);
  const arrowRef = useRef(null);
  const containerRef = useRef(null);
  const ourStoryRef = useRef(null);
  const trailHistory = useRef([]);
  const trailElements = useRef([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const [questionnaireData, setQuestionnaireData] = useState({
    partySize: 1,
    partyMembers: [],
    mainPersonDietaryPreference: '', // Dietary preference for main RSVP person
    // New structure for attendance and accommodation by date
    dec24: {
      attendance: false,
    },
    dec25: {
      attendance: false,
    },
    accommodation: {
      dec23: false,
      dec24: false,
      dec25: false,
    },
    concerns: '',
  });

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

    // Validate questionnaire is complete if shown
    if (showQuestionnaire) {
      // Check if at least one event is selected
      if (!questionnaireData.dec24.attendance && !questionnaireData.dec25.attendance) {
        setError('Please select attendance for at least one event');
        setSubmitting(false);
        return;
      }
    }

    try {
      const submissionData = {
        ...formData,
        ...(showQuestionnaire ? questionnaireData : {}),
      };
      console.log('Submitting registration data:', submissionData);
      console.log('Questionnaire shown:', showQuestionnaire);
      console.log('Questionnaire data:', questionnaireData);

      await apiClient.post('/api/guests/register', submissionData);
      setSubmitted(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Use useEffect with debounce to handle questionnaire visibility
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const shouldShowQuestionnaire =
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

      setShowQuestionnaire(shouldShowQuestionnaire);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.firstName, formData.lastName, formData.email]);

  const handleQuestionnaireChange = (field, value) => {
    setQuestionnaireData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePartySizeChange = (size) => {
    // Allow empty string (user clearing the field)
    if (size === '') {
      setQuestionnaireData((prev) => ({
        ...prev,
        partySize: '',
        partyMembers: [],
      }));
      return;
    }

    const newSize = parseInt(size, 10);

    // Handle invalid numbers (but allow empty string above)
    if (isNaN(newSize) || newSize < 1 || newSize > 20) {
      console.warn('Invalid party size:', size);
      return;
    }

    setQuestionnaireData((prev) => {
      const newMembers = [...prev.partyMembers];
      const currentSize = typeof prev.partySize === 'number' ? prev.partySize : 1;

      if (newSize > currentSize) {
        // Add new members with single dietary preference
        for (let i = currentSize; i < newSize; i++) {
          newMembers.push({
            firstName: '',
            lastName: '',
            dietaryPreference: '',
          });
        }
      } else if (newSize < currentSize) {
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

  const handlePartyMemberChange = (index, field, value) => {
    setQuestionnaireData((prev) => {
      const newMembers = [...prev.partyMembers];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return { ...prev, partyMembers: newMembers };
    });
  };

  const handleDateChange = (date, field, value) => {
    setQuestionnaireData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  const handleAccommodationChange = (date, value) => {
    setQuestionnaireData((prev) => ({
      ...prev,
      accommodation: {
        ...prev.accommodation,
        [date]: value,
      },
    }));
  };

  // Optimized GSAP Scroll Animation Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && pathRef.current && arrowRef.current) {
      const path = pathRef.current;
      const arrow = arrowRef.current;
      const pathLength = path.getTotalLength();
      const coupleImage = document.querySelector('[data-couple-image="true"]');

      // Set initial state
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      gsap.set(arrow, { opacity: 0, force3D: true });
      gsap.set(coupleImage, { opacity: 0, force3D: true });

      // Pre-create trail elements for better performance
      const svgContainer = containerRef.current?.querySelector('svg');
      if (svgContainer && trailElements.current.length === 0) {
        for (let i = 0; i < 4; i++) {
          // Reduced trail elements
          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const fireParticle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const hotCore = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

          glow.setAttribute('class', 'fire-trail');
          fireParticle.setAttribute('class', 'fire-trail');
          hotCore.setAttribute('class', 'fire-trail');
          glow.setAttribute('opacity', '0');
          fireParticle.setAttribute('opacity', '0');
          hotCore.setAttribute('opacity', '0');

          svgContainer.appendChild(glow);
          svgContainer.appendChild(fireParticle);
          svgContainer.appendChild(hotCore);

          trailElements.current.push({ glow, fireParticle, hotCore });
        }
      }

      // Simplified and optimized scroll animation
      const isMobile = window.innerWidth < 768;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'bottom 80%',
          end: isMobile
            ? `bottom+=${window.innerHeight * 0.4} top`
            : `bottom+=${window.innerHeight * 0.45} top`,
          scrub: 0.5, // Much smoother scrub for fluid animation
          markers: false, // Disable markers for production
          // High-performance scroll handler with RAF
          onUpdate: (self) => {
            // Use requestAnimationFrame for smooth 60fps updates
            requestAnimationFrame(() => {
              const progress = self.progress;

              // Simplified calculations
              const point = path.getPointAtLength(progress * pathLength);

              // Flower opacity - fade in early, fade out at end
              let opacity = 0;
              if (progress < 0.33) {
                opacity = Math.min(1, progress * 3); // Fade in
              } else if (progress > 0.85) {
                opacity = Math.max(0, (1 - progress) * 6.67); // Fade out (1-0.85 = 0.15, so 1/0.15 = 6.67)
              } else {
                opacity = 1; // Full opacity in middle
              }

              // Simplified photo opacity
              let imageOpacity = 0;
              if (progress > 0.15) {
                imageOpacity = Math.min(1, (progress - 0.15) * 3);
              }

              // GPU-accelerated batch DOM updates
              gsap.set(arrow, {
                x: point.x,
                y: point.y,
                opacity: opacity,
                force3D: true,
                transformOrigin: 'center center',
              });

              // Simplified trail effect for better performance
              if (opacity > 0 && trailElements.current.length > 0) {
                // Update only first few trail elements for performance
                const maxTrail = 4; // Reduced from 8
                trailHistory.current.push({ x: point.x, y: point.y });

                if (trailHistory.current.length > maxTrail) {
                  trailHistory.current.shift();
                }

                // Batch DOM updates for better performance
                const fragment = document.createDocumentFragment ? null : null;

                trailHistory.current.forEach((pos, index) => {
                  if (index < maxTrail && index < trailElements.current.length) {
                    const trailOpacity = (index + 1) / maxTrail;
                    const size = (index + 1) * 0.8; // Smaller particles
                    const elements = trailElements.current[index];

                    // Update only main particle for performance
                    elements.fireParticle.setAttribute('cx', pos.x);
                    elements.fireParticle.setAttribute('cy', pos.y);
                    elements.fireParticle.setAttribute('r', size);
                    elements.fireParticle.setAttribute('opacity', trailOpacity * 0.8);

                    // Hide glow and core for performance
                    elements.glow.setAttribute('opacity', '0');
                    elements.hotCore.setAttribute('opacity', '0');
                  }
                });

                // Hide remaining elements
                for (let i = maxTrail; i < trailElements.current.length; i++) {
                  const elements = trailElements.current[i];
                  elements.fireParticle.setAttribute('opacity', '0');
                }
              } else if (trailElements.current.length > 0) {
                // Hide all trail elements
                trailElements.current.forEach((elements) => {
                  elements.fireParticle.setAttribute('opacity', '0');
                });
              }

              // Position photo higher up so it doesn't cover the flower path
              if (progress >= 0.99) {
                // Only at the very end (99%), position above Our Story
                const ourStoryRect = ourStoryRef.current?.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const mobileOffset = isMobile ? 120 : 160;
                const finalY = ourStoryRect
                  ? ourStoryRect.top + scrollTop - mobileOffset
                  : scrollTop + window.innerHeight * 0.7;

                gsap.set(coupleImage, {
                  opacity: 1,
                  position: 'absolute',
                  left: '50%',
                  top: finalY + 'px',
                  transform: 'translate3d(-50%, -50%, 0)',
                  zIndex: 30,
                  force3D: true,
                });
              } else {
                // Position photo higher up so flower path is visible below it
                const topOffset = isMobile ? '35%' : '40%'; // Higher up on mobile
                gsap.set(coupleImage, {
                  opacity: imageOpacity,
                  position: 'fixed',
                  top: topOffset,
                  left: '50%',
                  transform: 'translate3d(-50%, -50%, 0)',
                  zIndex: 30,
                  force3D: true,
                });
              }
            });
          },
        },
      });

      tl.to(path, { strokeDashoffset: 0, ease: 'none' });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>{`${weddingData.bride} & ${weddingData.groom} - Wedding`}</title>
        <meta name="description" content="Join us for our special day" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen relative overflow-hidden">
        {/* Simple background */}
        <div className="absolute inset-0 bg-background">
          {/* Enhanced breathing gradient background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/12 via-primary/4 to-primary/8"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/18 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/12 to-primary/25 rounded-full blur-2xl animate-pulse delay-700"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/22 rounded-full blur-2xl animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-10 w-56 h-56 bg-primary/25 rounded-full blur-2xl animate-pulse delay-1200"></div>
          <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] bg-primary/16 rounded-full blur-2xl animate-pulse delay-800"></div>
          <div className="absolute bottom-1/3 right-1/3 w-[320px] h-[320px] bg-primary/20 rounded-full blur-2xl animate-pulse delay-400"></div>
          <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-t from-primary/8 via-primary/3 to-transparent"></div>

          {/* Static Sakura Petals - fixed positions to prevent jumping */}
          <div
            id="sakura-container"
            ref={(el) => {
              // Only create petals once to prevent re-rendering issues
              if (el && !el.hasChildNodes()) {
                Array.from({ length: 25 }, (_, i) => {
                  const size = 0.6 + ((i * 0.024) % 1.2); // Deterministic size based on index
                  const startY = (i * 20) % 1000; // Deterministic Y position
                  const animationDuration = 30 + ((i * 0.2) % 10); // Deterministic duration
                  const animationDelay = (i * 0.8) % 30; // Spread delays over 30 seconds
                  const drift = ((i * 5) % 60) - 30; // Deterministic drift

                  const petal = document.createElement('div');
                  petal.className = 'sakura-petal';
                  petal.style.top = `${startY}vh`;
                  petal.style.animationDuration = `${animationDuration}s`;
                  petal.style.animationDelay = `${animationDelay}s`;
                  petal.style.setProperty('--drift', `${drift}px`);
                  petal.style.setProperty('--size', size.toString());

                  el.appendChild(petal);
                });
              }
            }}
          ></div>
        </div>

        {/* Theme toggle in top right */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="hero-section relative min-h-screen flex items-center justify-center z-10 px-4 py-20">
          <div className="relative z-10 text-center space-y-8 sm:space-y-12 p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
            {/* Modern minimalist decoration */}
            <div className="flex items-center justify-center mb-12 animate-scale-in delay-300">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-6"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-6"></div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>

            {/* Main title */}
            <div className="space-y-6 sm:space-y-8 animate-slide-up delay-500">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-foreground mb-6 sm:mb-8 text-shadow leading-tight">
                {weddingData.bride}
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary my-4 sm:my-6 font-light">
                  &
                </span>
                {weddingData.groom}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-2xl mx-auto px-4">
                Together with our families, we invite you to celebrate our wedding
              </p>
            </div>

            {/* Wedding details */}
            <div className="space-y-6 sm:space-y-8 animate-slide-up delay-700">
              <div className="flex flex-col sm:flex-row items-center justify-center text-xl sm:text-2xl text-foreground font-light space-y-2 sm:space-y-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-0 sm:mr-4 text-primary" />
                <span className="text-center">{weddingData.date}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center text-base sm:text-lg text-muted-foreground font-light space-y-2 sm:space-y-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-3 text-primary" />
                <span className="text-center">
                  {weddingData.venue[0]} & {weddingData.venue[1]}, {weddingData.location}
                </span>
              </div>
            </div>

            {/* Scroll hint with bounce animation */}
            <div className="mt-12 sm:mt-16 text-center space-y-4 animate-bounce">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-muted-foreground font-light text-sm sm:text-base">
                  Scroll down to see our story unfold
                </p>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-primary/60 to-transparent rounded-full"></div>
              </div>
            </div>

            {/* Spacer for where photo would be */}
            <div className="mt-8 sm:mt-12 md:mt-16 h-80 sm:h-96 md:h-[28rem] lg:h-[32rem]"></div>
          </div>
        </div>

        {/* GSAP Animated couple photo that follows path and settles */}
        <div
          ref={(el) => {
            if (el) {
              el.dataset.coupleImage = 'true';
            }
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 pointer-events-none"
        >
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem]">
            <img
              src="/images/couple/divya-bharat.png"
              alt="Divya and Bharat"
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
            {/* Elegant frame overlay */}
            <div className="absolute inset-0 rounded-2xl border-4 border-primary/20 shadow-inner"></div>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 via-transparent to-transparent"></div>
          </div>

          {/* Optional decorative elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-primary/30 rounded-full blur-sm"></div>
        </div>

        {/* GSAP Scroll Animation - SVG Path */}
        <div ref={containerRef} className="relative">
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="800"
              height="800"
              viewBox="0 0 800 800"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-40"
            >
              <defs>
                <mask id="theMask" maskUnits="userSpaceOnUse">
                  <path
                    ref={pathRef}
                    id="motionPath"
                    d="M260.73,86c-110.45,75.91-176.44,210.72-168,343.25,2,30.9,8,62.47,25.16,88.42,21.19,32.15,57.4,52.35,95,62.24s76.89,10.6,115.75,11.23c41.5.68,83.29,1.35,154.19-5.58s111.33-22,142.26-49.28c53.09-29.22,73.22-70.72,82.7-113.52s24-87.12,21.23-130.84c-2.48-38.41-8.82-80.72-38.67-105.5-24.09-20-57.88-23.52-89.36-23.28-51.62.4-106.76,10.32-143.66,745.93C398.91,1146.1,478.41,2203,563,2355.91c-30,50-60,100-163,150C350,2550,340,2650,380,2750c20,50,20,100,20,150c0,100,0,200,0,300"
                    fill="none"
                    stroke="white"
                    strokeMiterlimit="10"
                    strokeWidth="8"
                  />
                </mask>
              </defs>

              {/* Pink jasmine flower as the moving arrow */}
              <g ref={arrowRef} id="pinkFlowerArrow">
                {/* Outer petals */}
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(0)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(45)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(90)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(135)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(180)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(225)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(270)"
                />
                <ellipse
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="10"
                  fill="#f472b6"
                  opacity="1.0"
                  transform="rotate(315)"
                />
                {/* Inner petals */}
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(22.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(67.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(112.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(157.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(202.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(247.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(292.5)"
                />
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="3.5"
                  ry="7"
                  fill="#ec4899"
                  opacity="1.0"
                  transform="rotate(337.5)"
                />
                {/* Center */}
                <circle cx="0" cy="0" r="3.5" fill="#f9a8d4" opacity="1.0" />
                <circle cx="0" cy="0" r="1.8" fill="#ec4899" opacity="0.9" />
              </g>
            </svg>
          </div>
        </div>

        {/* Spacer section for scroll animation */}
        <div className="py-32 sm:py-40 md:py-48 lg:py-56 relative z-10">
          <div className="max-w-5xl mx-auto px-4">
            {/* This space provides scroll area for the animation */}
            <div className="min-h-[60vh]"></div>
          </div>
        </div>

        {/* Our Story Section */}
        <div ref={ourStoryRef} className="py-16 sm:py-24 md:py-32 px-4 relative z-10">
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 sm:mb-8 text-shadow">
                Our Story
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-32 h-px bg-gradient-to-l from-transparent via-primary/50 to-primary"></div>
              </div>
            </div>

            <Card className="max-w-4xl mx-auto shadow-2xl gradient-card hover-lift animate-scale-in">
              <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16">
                <div className="text-center space-y-6 sm:space-y-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl text-foreground leading-relaxed font-light px-2">
                    We met on a sunny day in San Francisco and knew from that moment that we were
                    meant to be together. Now, we want to celebrate our love with all of you - our
                    family and friends.
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Section */}
        <div className="py-16 sm:py-24 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6 sm:mb-8 text-shadow">
                Join Our Celebration
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
                <Users className="w-6 h-6 text-primary" />
                <div className="w-32 h-px bg-gradient-to-l from-transparent via-primary/50 to-primary"></div>
              </div>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed px-4">
                We can't wait to celebrate with you! Please register below to receive your
                personalized RSVP invitation.
              </p>
            </div>

            {!showRegisterForm ? (
              <div className="text-center animate-fade-in">
                <Button
                  onClick={() => setShowRegisterForm(true)}
                  size="lg"
                  className="h-14 sm:h-16 px-8 sm:px-12 text-lg sm:text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Register Now
                </Button>
                <p className="text-muted-foreground mt-4 sm:mt-6 text-base sm:text-lg px-4">
                  Click to start your RSVP registration
                </p>
              </div>
            ) : (
              <div className="animate-slide-up-fade-in">
                {submitted ? (
                  <Card className="max-w-lg mx-auto shadow-2xl gradient-card hover-lift">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl font-serif text-foreground mb-3 sm:mb-4 px-4">
                        Registration Submitted!
                      </CardTitle>
                      <CardDescription className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
                        Thank you for registering,{' '}
                        <span className="font-semibold text-foreground">{formData.firstName}</span>!
                        Your request has been submitted and is pending approval.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 px-6">
                      <div className="bg-muted/50 rounded-xl p-4 sm:p-6 border border-border">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm sm:text-base">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          What happens next?
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                          We'll review your registration and send you a personalized RSVP link via
                          email or SMS once approved.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="max-w-lg mx-auto shadow-2xl gradient-card hover-lift">
                    <CardHeader className="text-center pb-4 sm:pb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground mb-3 sm:mb-4 px-4">
                        RSVP Registration
                      </CardTitle>
                      <CardDescription className="text-base sm:text-lg text-muted-foreground px-4">
                        Share your details to receive your invitation
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 px-4 sm:px-6">
                      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {error && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 sm:p-4">
                            <p className="text-destructive text-xs sm:text-sm font-medium">
                              {error}
                            </p>
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="firstName"
                              className="text-foreground font-medium flex items-center text-sm sm:text-base"
                            >
                              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              First Name *
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              placeholder="Enter your first name"
                              className="h-10 sm:h-12 text-sm sm:text-base bg-background/50 border-input"
                              required
                            />
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="lastName"
                              className="text-foreground font-medium flex items-center text-sm sm:text-base"
                            >
                              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Last Name *
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              placeholder="Enter your last name"
                              className="h-10 sm:h-12 text-sm sm:text-base bg-background/50 border-input"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="email"
                            className="text-foreground font-medium flex items-center text-sm sm:text-base"
                          >
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Email Address *
                          </Label>
                          <Input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                            className="h-10 sm:h-12 text-sm sm:text-base bg-background/50 border-input"
                            required
                          />
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="phone"
                            className="text-foreground font-medium flex items-center text-sm sm:text-base"
                          >
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Phone Number (optional)
                          </Label>
                          <Input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="h-10 sm:h-12 text-sm sm:text-base bg-background/50 border-input"
                          />
                        </div>

                        {showQuestionnaire && (
                          <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 border-t border-border animate-slide-up-fade-in">
                            <div className="text-center">
                              <h3 className="text-xl sm:text-2xl font-serif text-foreground mb-2 px-2">
                                RSVP Details
                              </h3>
                              <p className="text-muted-foreground text-sm sm:text-base px-2">
                                Please help us plan the perfect celebration
                              </p>
                            </div>

                            {/* Party Size */}
                            <div className="space-y-3 sm:space-y-4">
                              <Label className="text-foreground font-medium text-base sm:text-lg">
                                How many people are in your party? *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={
                                  questionnaireData.partySize === ''
                                    ? ''
                                    : questionnaireData.partySize.toString()
                                }
                                onChange={(e) => handlePartySizeChange(e.target.value)}
                                className="h-10 sm:h-12 text-sm sm:text-base bg-background/50 border-input w-24 sm:w-32"
                              />
                            </div>

                            {/* Main Person Dietary Preference */}
                            <div className="space-y-3 sm:space-y-4">
                              <Label className="text-foreground font-medium text-base sm:text-lg">
                                Your Dietary Preference
                              </Label>
                              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className="font-medium text-sm sm:text-base">
                                    {formData.firstName} {formData.lastName}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="mainPersonDietaryPreference"
                                      value="veg"
                                      checked={
                                        questionnaireData.mainPersonDietaryPreference === 'veg'
                                      }
                                      onChange={(e) =>
                                        handleQuestionnaireChange(
                                          'mainPersonDietaryPreference',
                                          e.target.value
                                        )
                                      }
                                      className="w-4 h-4 text-primary flex-shrink-0"
                                    />
                                    <span className="text-xs sm:text-sm">Vegetarian</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="mainPersonDietaryPreference"
                                      value="non-veg"
                                      checked={
                                        questionnaireData.mainPersonDietaryPreference === 'non-veg'
                                      }
                                      onChange={(e) =>
                                        handleQuestionnaireChange(
                                          'mainPersonDietaryPreference',
                                          e.target.value
                                        )
                                      }
                                      className="w-4 h-4 text-primary flex-shrink-0"
                                    />
                                    <span className="text-xs sm:text-sm">Non-Vegetarian</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Additional Party Members */}
                            {typeof questionnaireData.partySize === 'number' &&
                              questionnaireData.partySize > 1 && (
                                <div className="space-y-3 sm:space-y-4 animate-slide-up-fade-in">
                                  <p className="text-muted-foreground text-sm sm:text-base">
                                    Please provide names for additional party members:
                                  </p>
                                  {questionnaireData.partyMembers.map((member, index) => (
                                    <div
                                      key={index}
                                      className="p-3 sm:p-4 bg-muted/30 rounded-lg space-y-3 sm:space-y-4"
                                    >
                                      <div className="text-sm sm:text-base font-medium text-foreground mb-2">
                                        Party Member {index + 2}
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                          <Label className="text-xs sm:text-sm">First Name</Label>
                                          <Input
                                            value={member.firstName}
                                            onChange={(e) =>
                                              handlePartyMemberChange(
                                                index,
                                                'firstName',
                                                e.target.value
                                              )
                                            }
                                            placeholder="First name"
                                            className="h-9 sm:h-10 bg-background/50 text-sm sm:text-base"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs sm:text-sm">Last Name</Label>
                                          <Input
                                            value={member.lastName}
                                            onChange={(e) =>
                                              handlePartyMemberChange(
                                                index,
                                                'lastName',
                                                e.target.value
                                              )
                                            }
                                            placeholder="Last name"
                                            className="h-9 sm:h-10 bg-background/50 text-sm sm:text-base"
                                          />
                                        </div>
                                      </div>

                                      {/* Single Dietary Preference for this member */}
                                      <div>
                                        <Label className="text-xs sm:text-sm">
                                          Dietary Preference
                                        </Label>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`member-${index}-dietary`}
                                              value="veg"
                                              checked={member.dietaryPreference === 'veg'}
                                              onChange={(e) =>
                                                handlePartyMemberChange(
                                                  index,
                                                  'dietaryPreference',
                                                  e.target.value
                                                )
                                              }
                                              className="w-4 h-4 text-primary flex-shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm">Vegetarian</span>
                                          </label>
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`member-${index}-dietary`}
                                              value="non-veg"
                                              checked={member.dietaryPreference === 'non-veg'}
                                              onChange={(e) =>
                                                handlePartyMemberChange(
                                                  index,
                                                  'dietaryPreference',
                                                  e.target.value
                                                )
                                              }
                                              className="w-4 h-4 text-primary flex-shrink-0"
                                            />
                                            <span className="text-xs sm:text-sm">
                                              Non-Vegetarian
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Event Attendance & Accommodation - Stepper Table Design */}
                            <div className="space-y-8">
                              <div className="text-center">
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                  Event Attendance & Accommodation
                                </h3>
                                <p className="text-muted-foreground">
                                  Select which events you'll attend and if you need accommodation
                                </p>
                              </div>

                              {/* Date Headers with Connecting Line */}
                              <div className="relative">
                                {/* Connecting Line - from Dec 23 to Dec 25 */}
                                <div
                                  className="absolute top-8 h-0.5 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 z-0"
                                  style={{ left: 'calc(25% + 2rem)', width: 'calc(50%)' }}
                                ></div>

                                <div className="grid grid-cols-4 gap-4">
                                  {/* Empty header cell */}
                                  <div></div>

                                  {/* Date Headers */}
                                  <div className="text-center relative z-10">
                                    <div className="w-16 h-16 bg-background border-4 border-primary/30 rounded-full flex items-center justify-center shadow-lg mx-auto">
                                      <div className="text-center">
                                        <div className="text-xs font-medium text-primary">DEC</div>
                                        <div className="text-lg font-bold text-foreground">23</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-center relative z-10">
                                    <div className="w-16 h-16 bg-background border-4 border-primary/30 rounded-full flex items-center justify-center shadow-lg mx-auto">
                                      <div className="text-center">
                                        <div className="text-xs font-medium text-primary">DEC</div>
                                        <div className="text-lg font-bold text-foreground">24</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-center relative z-10">
                                    <div className="w-16 h-16 bg-background border-4 border-primary/30 rounded-full flex items-center justify-center shadow-lg mx-auto">
                                      <div className="text-center">
                                        <div className="text-xs font-medium text-primary">DEC</div>
                                        <div className="text-lg font-bold text-foreground">25</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Table-like Content */}
                              <div className="bg-muted/20 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
                                {/* Attending Row */}
                                <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
                                  <div className="font-medium text-foreground text-xs sm:text-sm">
                                    Attending
                                  </div>

                                  {/* Dec 23 - No attendance option, just placeholder */}
                                  <div className="text-center">
                                    <div className="text-muted-foreground text-xs sm:text-sm">
                                      —
                                    </div>
                                  </div>

                                  {/* Dec 24 - Raaga Riti */}
                                  <div className="text-center">
                                    <label className="flex flex-col items-center space-y-1 sm:space-y-2 cursor-pointer">
                                      <Checkbox
                                        checked={questionnaireData.dec24.attendance}
                                        onCheckedChange={(checked) =>
                                          handleDateChange('dec24', 'attendance', checked)
                                        }
                                      />
                                      <div className="text-center">
                                        <span className="text-xs sm:text-sm font-medium text-foreground">
                                          Raaga Riti
                                        </span>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                          4 - 10 PM
                                        </div>
                                      </div>
                                    </label>
                                  </div>

                                  {/* Dec 25 - Wedding */}
                                  <div className="text-center">
                                    <label className="flex flex-col items-center space-y-1 sm:space-y-2 cursor-pointer">
                                      <Checkbox
                                        checked={questionnaireData.dec25.attendance}
                                        onCheckedChange={(checked) =>
                                          handleDateChange('dec25', 'attendance', checked)
                                        }
                                      />
                                      <div className="text-center">
                                        <span className="text-xs sm:text-sm font-medium text-foreground">
                                          Wedding
                                        </span>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                          10:30 AM - 2:30 PM
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                </div>

                                {/* Separator Line */}
                                <div className="h-px bg-border"></div>

                                {/* Accommodation Row */}
                                <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
                                  <div className="font-medium text-foreground text-xs sm:text-sm">
                                    Accommodation
                                  </div>

                                  {/* Dec 23 */}
                                  <div className="text-center">
                                    <Checkbox
                                      checked={questionnaireData.accommodation.dec23}
                                      onCheckedChange={(checked) =>
                                        handleAccommodationChange('dec23', checked)
                                      }
                                    />
                                  </div>

                                  {/* Dec 24 */}
                                  <div className="text-center">
                                    <Checkbox
                                      checked={questionnaireData.accommodation.dec24}
                                      onCheckedChange={(checked) =>
                                        handleAccommodationChange('dec24', checked)
                                      }
                                    />
                                  </div>

                                  {/* Dec 25 */}
                                  <div className="text-center">
                                    <Checkbox
                                      checked={questionnaireData.accommodation.dec25}
                                      onCheckedChange={(checked) =>
                                        handleAccommodationChange('dec25', checked)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Concerns */}
                            <div className="space-y-4">
                              <Label className="text-foreground font-medium text-lg">
                                Any other concerns that we can help you with?
                              </Label>
                              <Textarea
                                value={questionnaireData.concerns}
                                onChange={(e) =>
                                  handleQuestionnaireChange('concerns', e.target.value)
                                }
                                placeholder="Please share any dietary restrictions, accessibility needs, or other requests..."
                                className="min-h-[100px] bg-background/50"
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                          size="lg"
                        >
                          {submitting ? (
                            <>
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                              {showQuestionnaire
                                ? 'Complete RSVP Registration'
                                : 'Register for RSVP'}
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="mt-4 sm:mt-6 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground px-2">
                          Already have an RSVP link? Check your email for your personal invitation.
                        </p>
                        <Button
                          variant="ghost"
                          onClick={() => setShowRegisterForm(false)}
                          className="mt-3 sm:mt-4 text-muted-foreground hover:text-foreground text-sm sm:text-base"
                        >
                          ← Go back
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wedding Details Section */}
        <div className="py-12 sm:py-16 md:py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4 sm:mb-6 px-2">
                Wedding Details
              </h2>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div className="w-32 h-px bg-gradient-to-l from-transparent via-primary/50 to-primary"></div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
              <Card className="shadow-xl gradient-card hover-lift">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-serif text-foreground">
                    Raaga Riti
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2 px-4 sm:px-6">
                  <div className="flex items-center justify-center text-base sm:text-lg font-medium text-foreground">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Dec 24th, 4 - 10 PM
                  </div>
                  <div className="flex items-center justify-center text-sm sm:text-base text-muted-foreground">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {weddingData.venue[1]}, {weddingData.location}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">Information</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl gradient-card hover-lift">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-serif text-foreground">
                    Wedding
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2 px-4 sm:px-6">
                  <div className="flex items-center justify-center text-base sm:text-lg font-medium text-foreground">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Dec 25th, 10:30 AM - 2:30 PM
                  </div>
                  <div className="flex items-center justify-center text-sm sm:text-base text-muted-foreground">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {weddingData.venue[1]}, {weddingData.location}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground"> Information</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                >
                  <a href="/photos">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    View Photos
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                >
                  <a href="/travel">
                    <Plane className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Travel Info
                  </a>
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground px-4">
                New guests can register above, existing guests check your email for your personal
                RSVP link
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
