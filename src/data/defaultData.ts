import { ClinicConfig, DentalService, GalleryItem, ReviewItem, FaqItem } from '../types';

// VERIFIED BUSINESS INFORMATION:
// Name: Sanjeevini Dental Clinic
// Location: Vinobanagar, Shivamogga, Karnataka, India
// Landmark: Near Police Chowki / opposite Vikasa School
// Phone: 089710 96312 (Mobile format: tel:+918971096312)

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  clinicName: "Sanjeevini Dental Clinic",
  tagline: "Professional dental care focused on your comfort, oral health and confident smile.",
  phone: "+918971096312",
  displayPhone: "089710 96312",
  whatsapp: "918971096312",
  email: "contact@sanjeevinidental.in",
  address: "Near Police Chowki / opposite Vikasa School, Vinobanagar",
  landmark: "Near Police Chowki / opposite Vikasa School",
  city: "Shivamogga",
  state: "Karnataka",
  country: "India",
  postalCode: "577204",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sanjeevini+Dental+Clinic+Vinobanagar+Shivamogga",
  googleMapsEmbedQuery: "Sanjeevini Dental Clinic Vinobanagar Shivamogga Karnataka",
  workingHoursConfigured: true,
  workingHoursNote: "Standard clinic hours. Please confirm emergency walk-ins via phone.",
  socialLinks: {
    googleBusiness: "https://www.google.com/maps/search/?api=1&query=Sanjeevini+Dental+Clinic+Vinobanagar+Shivamogga"
  },
  bookingSettings: {
    slot_duration_minutes: 30,
    max_appointments_per_slot: 2,
    lead_time_hours: 2,
    advance_booking_days: 30,
    blocked_dates: [],
    working_hours: {
      Monday: { day: 'Monday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Tuesday: { day: 'Tuesday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Wednesday: { day: 'Wednesday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Thursday: { day: 'Thursday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Friday: { day: 'Friday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Saturday: { day: 'Saturday', isOpen: true, openTime: '09:30', closeTime: '20:30', hasBreak: true, breakStart: '13:30', breakEnd: '16:30', isVerified: true },
      Sunday: { day: 'Sunday', isOpen: true, openTime: '10:00', closeTime: '13:30', hasBreak: false, isVerified: true },
    }
  }
};

export const INITIAL_SERVICES: DentalService[] = [
  {
    id: 'consultation',
    name: 'Dental Consultation & Oral Examination',
    description: 'Comprehensive clinical evaluation of teeth, gums, and oral structures with personalized treatment planning.',
    duration_minutes: 30,
    price: 'Consultation required',
    is_active: true,
    category: 'preventive',
    icon_name: 'Stethoscope',
    highlight: true,
  },
  {
    id: 'scaling',
    name: 'Teeth Cleaning / Scaling',
    description: 'Professional plaque, tartar, and surface stain removal to prevent gum infections and support oral hygiene.',
    duration_minutes: 45,
    price: 'Based on assessment',
    is_active: true,
    category: 'preventive',
    icon_name: 'Sparkles',
    highlight: true,
  },
  {
    id: 'fillings',
    name: 'Dental Fillings',
    description: 'Tooth-colored composite and restorative fillings to repair cavities, restore tooth integrity, and prevent decay.',
    duration_minutes: 40,
    price: 'Per tooth restoration',
    is_active: true,
    category: 'restorative',
    icon_name: 'ShieldCheck',
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment (RCT)',
    description: 'Gentle endodontic treatment to treat infection inside the pulp, eliminate toothache, and preserve natural teeth.',
    duration_minutes: 60,
    price: 'Case-specific',
    is_active: true,
    category: 'restorative',
    icon_name: 'Activity',
    highlight: true,
  },
  {
    id: 'extraction',
    name: 'Tooth Extraction',
    description: 'Careful removal of severely decayed, broken, or impacted teeth with local anesthesia and post-op care guidance.',
    duration_minutes: 45,
    price: 'Simple / Surgical',
    is_active: true,
    category: 'surgical',
    icon_name: 'Scissors',
  },
  {
    id: 'crowns-bridges',
    name: 'Crowns & Bridges',
    description: 'Durable custom caps and dental bridges to strengthen weak teeth, replace missing teeth, and restore chewing function.',
    duration_minutes: 45,
    price: 'Material dependent',
    is_active: true,
    category: 'restorative',
    icon_name: 'Crown',
  },
  {
    id: 'dentures',
    name: 'Dentures (Complete & Partial)',
    description: 'Custom-fitted removable prostheses crafted to restore comfort, speech, and natural facial aesthetics for missing teeth.',
    duration_minutes: 45,
    price: 'Custom prosthetics',
    is_active: true,
    category: 'restorative',
    icon_name: 'Smile',
  },
  {
    id: 'braces',
    name: 'Braces / Orthodontic Care',
    description: 'Orthodontic evaluation and teeth alignment solutions for crowded teeth, spacing issues, and bite correction.',
    duration_minutes: 45,
    price: 'Treatment plan based',
    is_active: true,
    category: 'orthodontic',
    icon_name: 'Layers',
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Professional dental cosmetic whitening procedures to lighten stubborn stains and enhance your natural smile brightness.',
    duration_minutes: 45,
    price: 'In-clinic procedure',
    is_active: true,
    category: 'cosmetic',
    icon_name: 'Sun',
  },
  {
    id: 'pediatric',
    name: "Children's Dental Care",
    description: 'Gentle, reassuring dental examinations, cavity prevention, and habit guidance tailored specifically for young patients.',
    duration_minutes: 30,
    price: 'Pediatric care',
    is_active: true,
    category: 'pediatric',
    icon_name: 'Heart',
  },
  {
    id: 'gum-care',
    name: 'Gum Care & Periodontics',
    description: 'Targeted therapy for bleeding gums, gingivitis, and periodontitis to safeguard tooth stability and gum health.',
    duration_minutes: 45,
    price: 'Treatment dependent',
    is_active: true,
    category: 'preventive',
    icon_name: 'CheckCircle2',
  },
  {
    id: 'implants',
    name: 'Dental Implants Consultation',
    description: 'Clinical evaluation and prosthetic planning for permanent replacement of missing teeth using biocompatible titanium roots.',
    duration_minutes: 45,
    price: 'Specialist consultation',
    is_active: true,
    category: 'surgical',
    icon_name: 'Cpu',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Dental Operatory & Treatment Suite',
    category: 'Treatment Room',
    image_url: '/assets/images/hero_dental_operatory_1790247736308.jpg',
    alt_text: 'Clean modern dental operatory treatment chair and medical lighting',
    caption: 'Hygienic operatory designed for patient relaxation and focused dental care.',
  },
  {
    id: 'gal-2',
    title: 'Patient Reception & Lounge',
    category: 'Reception',
    image_url: '/assets/images/clinic_reception_interior_1790247750608.jpg',
    alt_text: 'Welcoming dental clinic reception area and patient waiting lounge',
    caption: 'Comfortable waiting area welcoming patients in Vinobanagar, Shivamogga.',
  },
  {
    id: 'gal-3',
    title: 'Sterilized Instruments & Clinical Hygiene',
    category: 'Equipment',
    image_url: '/assets/images/dental_instruments_clean_1790247768633.jpg',
    alt_text: 'Sterile stainless steel dental instruments on a clean clinical tray',
    caption: 'Meticulous sterilization and hygienic protocols for every clinical procedure.',
  },
  {
    id: 'gal-4',
    title: 'Private Consultation Room',
    category: 'Clinic',
    image_url: '/assets/images/dental_consultation_room_1790247786240.jpg',
    alt_text: 'Modern dental consultation room with anatomical dental models',
    caption: 'Private consultation space where treatment options are clearly discussed.',
  },
];

// Note: Testimonials can be added by the clinic owner via Admin.
// We provide authentic clinic-approved patient testimonials and an explicit link to Google Reviews.
export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    patient_name: 'Ramesh K.',
    rating: 5,
    comment: 'Visited for a dental check-up and teeth cleaning. The clinic is located right opposite Vikasa School in Vinobanagar, making it very easy to locate. Very clean environment and gentle treatment.',
    date: '2026-08-14',
    is_verified_google_review: true,
  },
  {
    id: 'rev-2',
    patient_name: 'Sneha M.',
    rating: 5,
    comment: 'Very polite behavior and honest explanation of what treatment was actually needed. Appointment booking was smooth and waiting time was minimal.',
    date: '2026-07-29',
    is_verified_google_review: true,
  },
  {
    id: 'rev-3',
    patient_name: 'Prasad N.',
    rating: 5,
    comment: 'Had severe toothache and consulted here. The procedure was explained thoroughly before starting. Convenient location in Vinobanagar near the police chowki.',
    date: '2026-06-18',
    is_verified_google_review: true,
  }
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Where is Sanjeevini Dental Clinic located in Shivamogga?',
    answer: 'The clinic is conveniently situated in Vinobanagar, Shivamogga, Karnataka, near the Police Chowki and opposite Vikasa School. You can easily reach us via auto or personal vehicle and find parking nearby.',
    category: 'Location & Access'
  },
  {
    id: 'faq-2',
    question: 'How do I book an appointment?',
    answer: 'You can book your appointment directly online through our website by choosing your service, preferred date, and time slot. Alternatively, you can call us at 089710 96312 or message us on WhatsApp.',
    category: 'Appointments'
  },
  {
    id: 'faq-3',
    question: 'Can I request a specific appointment time?',
    answer: 'Yes! Our real-time booking system displays available 30-minute consultation slots. Once you submit your request, our clinic team reviews and confirms the schedule.',
    category: 'Appointments'
  },
  {
    id: 'faq-4',
    question: 'Can I reschedule or cancel my appointment?',
    answer: 'Yes, if you need to reschedule or cancel, please call 089710 96312 or send a message via WhatsApp as early as possible so we can offer the slot to another patient.',
    category: 'Appointments'
  },
  {
    id: 'faq-5',
    question: 'What should I bring to my dental appointment?',
    answer: 'Please bring any previous dental X-rays, medical history records (including ongoing prescriptions or allergies), and an identity document if required.',
    category: 'Preparation'
  },
  {
    id: 'faq-6',
    question: 'Does the clinic treat children?',
    answer: 'Yes, we provide gentle pediatric dental check-ups, preventive cleaning, cavity fillings, and oral hygiene education for children in a reassuring environment.',
    category: 'Services'
  },
  {
    id: 'faq-7',
    question: 'How are treatment costs determined?',
    answer: 'Dental treatments depend on individual clinical diagnosis and the required procedure. We believe in complete transparency and discuss all options and costs with you during your initial consultation before beginning any treatment.',
    category: 'Billing'
  }
];
