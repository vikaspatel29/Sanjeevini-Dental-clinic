export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email?: string;
  service_id: string;
  service_name: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. "10:30 AM"
  message?: string;
  status: AppointmentStatus;
  created_at: string;
  notes?: string;
  supabase_synced?: boolean;
  supabase_error?: string;
}

export interface DentalService {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price?: string; // empty or "Consultation required" unless set by clinic
  is_active: boolean;
  category: 'preventive' | 'restorative' | 'surgical' | 'cosmetic' | 'pediatric' | 'orthodontic';
  icon_name: string;
  highlight?: boolean;
}

export interface DayWorkingHours {
  day: string; // Monday, Tuesday, etc.
  isOpen: boolean;
  openTime: string; // "09:30"
  closeTime: string; // "20:30"
  hasBreak: boolean;
  breakStart?: string; // "13:30"
  breakEnd?: string; // "16:30"
  isVerified: boolean; // Flag to distinguish verified vs placeholder
}

export interface BookingSettings {
  slot_duration_minutes: number;
  max_appointments_per_slot: number;
  lead_time_hours: number;
  advance_booking_days: number;
  blocked_dates: string[]; // YYYY-MM-DD
  working_hours: Record<string, DayWorkingHours>;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Clinic' | 'Treatment Room' | 'Reception' | 'Equipment' | 'Team' | 'Patient Experience';
  image_url: string;
  alt_text: string;
  caption?: string;
}

export interface ReviewItem {
  id: string;
  patient_name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  is_verified_google_review: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface NotificationLog {
  id: string;
  type: 'admin_new_booking' | 'patient_confirmation' | 'patient_cancellation' | 'patient_reminder';
  recipient: string;
  subject: string;
  body: string;
  sent_at: string;
  status: 'sent' | 'delivered';
}

export interface ClinicConfig {
  clinicName: string;
  tagline: string;
  phone: string;
  displayPhone: string;
  whatsapp: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  googleMapsUrl: string;
  googleMapsEmbedQuery: string;
  workingHoursConfigured: boolean; // false until owner confirms
  workingHoursNote: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    googleBusiness?: string;
  };
  bookingSettings: BookingSettings;
}
