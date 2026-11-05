import { ClinicConfig, DentalService, Appointment, GalleryItem, ReviewItem, NotificationLog, AppointmentStatus } from '../types';
import { DEFAULT_CLINIC_CONFIG, INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS } from '../data/defaultData';
import {
  saveAppointmentToSupabase,
  updateAppointmentInSupabase,
  updateAppointmentFullInSupabase,
  deleteAppointmentInSupabase,
  checkSupabaseHealth,
  fetchAppointmentsFromSupabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_SQL_SETUP
} from './supabase';

const LOCAL_STORAGE_KEY_PREFIX = 'sanjeevini_dental_';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return fallback;
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

export const api = {
  // Config
  async getConfig(): Promise<ClinicConfig> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setLocal('config', data.config);
          return data.config;
        }
      }
    } catch (e) {
      // fallback
    }
    return getLocal<ClinicConfig>('config', DEFAULT_CLINIC_CONFIG);
  },

  async updateConfig(newConfig: Partial<ClinicConfig>): Promise<ClinicConfig> {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setLocal('config', data.config);
        return data.config;
      }
    } catch (e) {}
    const current = getLocal<ClinicConfig>('config', DEFAULT_CLINIC_CONFIG);
    const updated = { ...current, ...newConfig };
    setLocal('config', updated);
    return updated;
  },

  // Services
  async getServices(): Promise<DentalService[]> {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.services) {
          setLocal('services', data.services);
          return data.services;
        }
      }
    } catch (e) {}
    return getLocal<DentalService[]>('services', INITIAL_SERVICES);
  },

  async createService(srv: Partial<DentalService>): Promise<DentalService> {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(srv)
      });
      if (res.ok) {
        const data = await res.json();
        return data.service;
      }
    } catch (e) {}
    const current = getLocal<DentalService[]>('services', INITIAL_SERVICES);
    const newService: DentalService = {
      id: srv.id || `srv-${Date.now()}`,
      name: srv.name || 'New Dental Service',
      description: srv.description || '',
      duration_minutes: srv.duration_minutes || 30,
      price: srv.price || 'Consultation required',
      is_active: srv.is_active ?? true,
      category: srv.category || 'preventive',
      icon_name: srv.icon_name || 'Stethoscope'
    };
    current.push(newService);
    setLocal('services', current);
    return newService;
  },

  async updateService(id: string, srv: Partial<DentalService>): Promise<DentalService> {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(srv)
      });
      if (res.ok) {
        const data = await res.json();
        return data.service;
      }
    } catch (e) {}
    const current = getLocal<DentalService[]>('services', INITIAL_SERVICES);
    const idx = current.findIndex(s => s.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...srv };
      setLocal('services', current);
      return current[idx];
    }
    throw new Error('Service not found');
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {}
    const current = getLocal<DentalService[]>('services', INITIAL_SERVICES);
    setLocal('services', current.filter(s => s.id !== id));
    return true;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    let localList: Appointment[] = [];
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (data.appointments) {
          localList = data.appointments;
        }
      }
    } catch (e) {}

    // Direct Supabase query check
    try {
      const sbData = await fetchAppointmentsFromSupabase();
      if (sbData && sbData.length > 0) {
        const map = new Map<string, Appointment>();
        // Add local first
        for (const item of localList) {
          map.set(item.id, item);
        }
        // Override/add with Supabase
        for (const sbItem of sbData) {
          map.set(sbItem.id, { ...sbItem, supabase_synced: true });
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setLocal('appointments', merged);
        return merged;
      }
    } catch (sbE) {}

    if (localList.length > 0) {
      setLocal('appointments', localList);
      return localList;
    }

    return getLocal<Appointment[]>('appointments', [
      {
        id: 'apt-sample-1',
        patient_name: 'Anand Gowda',
        phone: '9845123456',
        email: 'anand.g@example.com',
        service_id: 'consultation',
        service_name: 'Dental Consultation & Oral Examination',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:30 AM',
        message: 'Routine check-up and mild sensitivity in lower molar.',
        status: 'confirmed',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        supabase_synced: false
      },
      {
        id: 'apt-sample-2',
        patient_name: 'Pooja Hegde',
        phone: '8970112233',
        email: 'pooja.h@example.com',
        service_id: 'scaling',
        service_name: 'Teeth Cleaning / Scaling',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '11:30 AM',
        message: 'Plaque cleaning and gum evaluation.',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        supabase_synced: false
      }
    ]);
  },

  async createAppointment(appointmentData: {
    patient_name: string;
    phone: string;
    email?: string;
    service_id: string;
    service_name?: string;
    appointment_date: string;
    appointment_time: string;
    message?: string;
  }): Promise<Appointment> {
    let newApt: Appointment | null = null;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit appointment request');
      }
      newApt = data.appointment;
    } catch (e: any) {
      if (e.message && e.message.includes('slot is no longer available')) {
        throw e;
      }
      // If server unreachable, save locally with double-booking check
      const current = getLocal<Appointment[]>('appointments', []);
      const existingInSlot = current.filter(
        a => a.appointment_date === appointmentData.appointment_date &&
             a.appointment_time === appointmentData.appointment_time &&
             a.status !== 'cancelled'
      );
      if (existingInSlot.length >= 2) {
        throw new Error('This appointment slot is no longer available. Please choose another time.');
      }
      newApt = {
        id: `apt-${Date.now()}`,
        patient_name: appointmentData.patient_name,
        phone: appointmentData.phone,
        email: appointmentData.email,
        service_id: appointmentData.service_id,
        service_name: appointmentData.service_name || 'Dental Consultation',
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        message: appointmentData.message,
        status: 'pending',
        created_at: new Date().toISOString(),
        supabase_synced: false
      };
      current.unshift(newApt);
      setLocal('appointments', current);
    }

    // Direct client sync to Supabase (ensures immediate database write from browser)
    if (newApt) {
      try {
        const sbResult = await saveAppointmentToSupabase(newApt);
        if (sbResult.success) {
          newApt.supabase_synced = true;
          newApt.supabase_error = undefined;
        } else if (sbResult.error) {
          newApt.supabase_synced = false;
          newApt.supabase_error = sbResult.error;
        }
      } catch (err: any) {
        newApt.supabase_synced = false;
        newApt.supabase_error = err?.message;
      }
      return newApt;
    }

    throw new Error('Failed to create appointment');
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string): Promise<Appointment> {
    // Also sync to Supabase directly
    updateAppointmentInSupabase(id, status, notes).catch(e => console.warn('Supabase status sync error:', e));

    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        const data = await res.json();
        return data.appointment;
      }
    } catch (e) {}
    const current = getLocal<Appointment[]>('appointments', []);
    const apt = current.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      if (notes !== undefined) apt.notes = notes;
      setLocal('appointments', current);
      return apt;
    }
    throw new Error('Appointment not found');
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    // Attempt direct sync to Supabase
    updateAppointmentFullInSupabase(id, updates).catch(e => console.warn('Supabase full update error:', e));

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        // Update local cache
        const current = getLocal<Appointment[]>('appointments', []);
        const idx = current.findIndex(a => a.id === id);
        if (idx !== -1) {
          current[idx] = data.appointment;
          setLocal('appointments', current);
        }
        return data.appointment;
      }
    } catch (e) {}

    // Fallback: update in localStorage
    const current = getLocal<Appointment[]>('appointments', []);
    const idx = current.findIndex(a => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocal('appointments', current);
      return current[idx];
    }
    throw new Error('Appointment not found');
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    try {
      const res = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const data = await res.json();
        const current = getLocal<Appointment[]>('appointments', []);
        const idx = current.findIndex(a => a.id === id);
        if (idx !== -1) {
          current[idx] = data.appointment;
          setLocal('appointments', current);
        }
        return data.appointment;
      }
    } catch (e) {}

    // Fallback to updateAppointmentStatus
    const notesAddition = reason ? `Cancelled by clinic. Reason: ${reason}` : 'Cancelled by clinic';
    return this.updateAppointmentStatus(id, 'cancelled', notesAddition);
  },

  async deleteAppointment(id: string): Promise<boolean> {
    // Delete in Supabase
    deleteAppointmentInSupabase(id).catch(e => console.warn('Supabase delete error:', e));

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {}
    const current = getLocal<Appointment[]>('appointments', []);
    setLocal('appointments', current.filter(a => a.id !== id));
    return true;
  },

  // Supabase Database Management
  async getSupabaseStatus(): Promise<any> {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    return await checkSupabaseHealth();
  },

  async syncAllToSupabase(): Promise<{ success: boolean; synced: number; failed: number; total: number }> {
    try {
      const res = await fetch('/api/supabase/sync-all', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Browser-side fallback sync
    const appointments = getLocal<Appointment[]>('appointments', []);
    let synced = 0;
    let failed = 0;
    for (const apt of appointments) {
      const result = await saveAppointmentToSupabase(apt);
      if (result.success) {
        apt.supabase_synced = true;
        synced++;
      } else {
        apt.supabase_synced = false;
        apt.supabase_error = result.error;
        failed++;
      }
    }
    setLocal('appointments', appointments);
    return { success: true, synced, failed, total: appointments.length };
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        if (data.gallery) {
          setLocal('gallery', data.gallery);
          return data.gallery;
        }
      }
    } catch (e) {}
    return getLocal<GalleryItem[]>('gallery', INITIAL_GALLERY);
  },

  // Reviews
  async getReviews(): Promise<ReviewItem[]> {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setLocal('reviews', data.reviews);
          return data.reviews;
        }
      }
    } catch (e) {}
    return getLocal<ReviewItem[]>('reviews', INITIAL_REVIEWS);
  },

  async createReview(rev: Partial<ReviewItem>): Promise<ReviewItem> {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rev)
      });
      if (res.ok) {
        const data = await res.json();
        return data.review;
      }
    } catch (e) {}
    const current = getLocal<ReviewItem[]>('reviews', INITIAL_REVIEWS);
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      patient_name: rev.patient_name || 'Patient',
      rating: rev.rating || 5,
      comment: rev.comment || '',
      date: rev.date || new Date().toISOString().split('T')[0],
      is_verified_google_review: Boolean(rev.is_verified_google_review)
    };
    current.unshift(newRev);
    setLocal('reviews', current);
    return newRev;
  },

  // Notifications Log
  async getNotifications(): Promise<NotificationLog[]> {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch (e) {}
    return [];
  },

  // Admin Verification
  async verifyAdminPin(pin: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) return true;
    } catch (e) {}
    // Offline / fallback verification
    return pin === '9631' || pin === 'admin123';
  }
};

// WhatsApp link generator with strictly structured text
export function createWhatsAppBookingUrl(phone: string, details?: { name?: string; service?: string; date?: string; time?: string }): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const nameText = details?.name ? details.name : '';
  const serviceText = details?.service ? details.service : '';
  const dateText = details?.date ? details.date : '';
  const timeText = details?.time ? details.time : '';

  const message = `Hello Sanjeevini Dental Clinic,\nI would like to book an appointment.\n\nName: ${nameText}\nService: ${serviceText}\nPreferred Date: ${dateText}\nPreferred Time: ${timeText}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Google Calendar URL generator
export function createGoogleCalendarUrl(appointment: Appointment): string {
  const title = encodeURIComponent(`Dental Appointment: ${appointment.service_name} - Sanjeevini Dental Clinic`);
  const details = encodeURIComponent(`Appointment at Sanjeevini Dental Clinic, Vinobanagar, Shivamogga. Patient: ${appointment.patient_name}. Clinic Phone: 089710 96312`);
  const location = encodeURIComponent('Sanjeevini Dental Clinic, Vinobanagar, Shivamogga, Karnataka');
  
  // Format date and time
  const dateParts = appointment.appointment_date.split('-');
  const y = dateParts[0];
  const m = dateParts[1];
  const d = dateParts[2];
  
  // Parse time (e.g. "10:30 AM")
  let [timeStr, modifier] = appointment.appointment_time.split(' ');
  let [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const pad = (n: number) => n < 10 ? '0' + n : '' + n;
  const startHours = pad(hours);
  const startMinutes = minutesStr;
  
  // 45 min duration default
  const endHours = pad((hours + 1) % 24);
  const endMinutes = startMinutes;

  const startFormatted = `${y}${m}${d}T${startHours}${startMinutes}00`;
  const endFormatted = `${y}${m}${d}T${endHours}${endMinutes}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;
}
