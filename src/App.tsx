import React, { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustLocationStrip } from './components/TrustLocationStrip';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { BookingSection } from './components/BookingSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { LocationMapSection } from './components/LocationMapSection';
import { ContactCtaSection } from './components/ContactCtaSection';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPage } from './components/AdminLoginPage';
import { useCurrentPath, navigate } from './services/router';
import { api } from './services/api';
import { ClinicConfig, DentalService, GalleryItem, ReviewItem, Appointment } from './types';
import { DEFAULT_CLINIC_CONFIG, INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS } from './data/defaultData';

export default function App() {
  const currentPath = useCurrentPath();
  const [config, setConfig] = useState<ClinicConfig>(DEFAULT_CLINIC_CONFIG);
  const [services, setServices] = useState<DentalService[]>(INITIAL_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [serviceToBook, setServiceToBook] = useState<DentalService | null>(null);

  // Load live data from API or localStorage
  useEffect(() => {
    api.getConfig().then(setConfig);
    api.getServices().then(setServices);
    api.getGallery().then(setGallery);
    api.getReviews().then(setReviews);
  }, []);

  const scrollToBooking = (srv?: DentalService) => {
    if (srv) {
      setServiceToBook(srv);
    }
    const el = document.getElementById('book-appointment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSuccess = (newApt: Appointment) => {
    console.log('New appointment recorded:', newApt);
  };

  // Route 1: Dedicated Admin Login Page at /admin/login
  if (currentPath === '/admin/login') {
    return <AdminLoginPage onNavigate={navigate} />;
  }

  // Route 2: Protected Admin Dashboard at /admin/dashboard (or /admin)
  if (currentPath === '/admin/dashboard' || currentPath === '/admin') {
    return (
      <AdminDashboard
        isOpen={true}
        isStandalonePage={true}
        onNavigate={navigate}
        config={config}
        onConfigUpdated={(updated) => setConfig(updated)}
        onServicesUpdated={(updatedSrv) => setServices(updatedSrv)}
      />
    );
  }

  // Route 3: Public Clinic Website (Design completely unchanged)
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-cyan-100 selection:text-cyan-900">
      {/* Skip to Main Content Link for WCAG Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-cyan-700 text-white rounded-lg font-semibold text-xs shadow-lg"
      >
        Skip to main content
      </a>

      {/* Verified Location & Contact Announcement Bar */}
      <AnnouncementBar
        config={config}
        onOpenAdmin={() => navigate('/admin/dashboard')}
      />

      {/* Main Sticky Navbar */}
      <Navbar
        config={config}
        onBookClick={() => scrollToBooking()}
        onOpenAdmin={() => navigate('/admin/dashboard')}
      />

      {/* Primary Semantic Main Body */}
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        
        {/* Hero Section */}
        <Hero
          config={config}
          onBookClick={() => scrollToBooking()}
        />

        {/* Location & Contact Trust Strip */}
        <TrustLocationStrip config={config} />

        {/* About Section */}
        <AboutSection
          config={config}
          onBookClick={() => scrollToBooking()}
        />

        {/* Services Showcase */}
        <ServicesSection
          services={services}
          onSelectServiceToBook={(srv) => scrollToBooking(srv)}
        />

        {/* Interactive 5-Step Booking Flow */}
        <BookingSection
          services={services}
          config={config}
          preSelectedService={serviceToBook}
          onBookingSuccess={handleBookingSuccess}
        />

        {/* Why Choose Us */}
        <WhyChooseUs
          config={config}
          onBookClick={() => scrollToBooking()}
        />

        {/* Facility & Clinic Gallery */}
        <GallerySection gallery={gallery} />

        {/* Patient Reviews & Google Reviews Link */}
        <ReviewsSection
          reviews={reviews}
          config={config}
        />

        {/* FAQ Accordion */}
        <FaqSection config={config} />

        {/* Location, Google Maps & Operating Hours */}
        <LocationMapSection config={config} />

        {/* Ready to take care of your smile CTA */}
        <ContactCtaSection
          config={config}
          onBookClick={() => scrollToBooking()}
        />

      </main>

      {/* Footer */}
      <Footer
        config={config}
        onBookClick={() => scrollToBooking()}
        onOpenAdmin={() => navigate('/admin/dashboard')}
      />

      {/* Persistent Mobile Bottom Bar */}
      <MobileBottomBar
        config={config}
        onBookClick={() => scrollToBooking()}
      />
    </div>
  );
}
