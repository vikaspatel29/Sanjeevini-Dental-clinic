import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, AppointmentStatus } from '../types';

export const SUPABASE_PROJECT_ID = 'aabxoflwagxdepnrpcez';
export const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL as string) || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_Wi33_pjU5niFJISf2XUYag_97UkhkzJ';

export const SUPABASE_SQL_SETUP = `-- ==============================================================================
-- Sanjeevini Dental Clinic: Supabase Database Setup & Strict Row Level Security (RLS)
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new
-- 2. Paste and click "Run" to execute this SQL script
-- ==============================================================================

-- 1. Create the appointments table if it does not exist
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id TEXT,
  service_name TEXT,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ensure all columns exist if table was previously created with minimal columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'notes') THEN
    ALTER TABLE public.appointments ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'created_at') THEN
    ALTER TABLE public.appointments ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'status') THEN
    ALTER TABLE public.appointments ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing / legacy policies
DROP POLICY IF EXISTS "Allow public insert to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public select of appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public update of appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public delete of appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Only authenticated admins can read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Only authenticated admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Only authenticated admins can delete appointments" ON public.appointments;

-- POLICY 1: Patients can ONLY insert appointments (Public / Anon / Authenticated)
-- Anyone booking through the clinic website can submit a new appointment request.
CREATE POLICY "Patients can create appointments" 
ON public.appointments FOR INSERT 
TO anon, authenticated, public
WITH CHECK (true);

-- POLICY 2: ONLY authenticated clinic admins can view appointment records (SELECT)
-- Protects patient privacy by preventing unauthenticated access to appointment listings.
CREATE POLICY "Only authenticated admins can read appointments" 
ON public.appointments FOR SELECT 
TO authenticated
USING (auth.role() = 'authenticated');

-- POLICY 3: ONLY authenticated clinic admins can update appointment records (UPDATE)
-- Allows admins to confirm, reschedule, mark completed, or add doctor notes.
CREATE POLICY "Only authenticated admins can update appointments" 
ON public.appointments FOR UPDATE 
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- POLICY 4: ONLY authenticated clinic admins can delete appointment records (DELETE)
-- Allows admins to remove cancelled or duplicate records.
CREATE POLICY "Only authenticated admins can delete appointments" 
ON public.appointments FOR DELETE 
TO authenticated
USING (auth.role() = 'authenticated');

-- 5. Enable Realtime updates for the appointments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Realtime publication already configured or managed
END $$;
`;

export let supabase: SupabaseClient;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
}

/**
 * Supabase Authentication methods for Admin Login
 */
export async function signInAdmin(email: string, password: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpAdmin(email: string, password: string) {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.auth.signUp({ email, password });
}

export async function signOutAdmin() {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAdminUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAdminAuthStateChange(callback: (event: string, session: any) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export interface SupabaseHealth {
  connected: boolean;
  tableExists: boolean;
  projectId: string;
  url: string;
  errorMessage?: string;
  code?: string;
}

/**
 * Checks connection to Supabase and verifies if the appointments table exists.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  if (!supabase) {
    return {
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      errorMessage: 'Supabase client not initialized'
    };
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .select('id')
      .limit(1);

    if (!error) {
      return {
        connected: true,
        tableExists: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL
      };
    }

    // PGRST205 indicates table does not exist in public schema cache
    if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
      return {
        connected: true,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        code: error.code,
        errorMessage: 'Table "appointments" has not been created yet in Supabase.'
      };
    }

    return {
      connected: true,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      code: error.code,
      errorMessage: error.message
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      errorMessage: err?.message || 'Network error connecting to Supabase'
    };
  }
}

/**
 * Saves a new appointment to Supabase table
 */
export async function saveAppointmentToSupabase(appointment: Appointment): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const record = {
      id: appointment.id,
      patient_name: appointment.patient_name,
      phone: appointment.phone,
      email: appointment.email || null,
      service_id: appointment.service_id,
      service_name: appointment.service_name,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      message: appointment.message || null,
      status: appointment.status || 'pending',
      notes: appointment.notes || null,
      created_at: appointment.created_at || new Date().toISOString()
    };

    const { error } = await supabase
      .from('appointments')
      .upsert(record);

    if (error) {
      console.warn('Supabase insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase insert exception:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Fetches appointments directly from Supabase
 */
export async function fetchAppointmentsFromSupabase(): Promise<Appointment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch from Supabase:', error.message);
      return null;
    }

    return (data as Appointment[]).map(item => ({
      ...item,
      supabase_synced: true
    }));
  } catch (err) {
    console.warn('Exception querying Supabase appointments:', err);
    return null;
  }
}

/**
 * Updates appointment status in Supabase
 */
export async function updateAppointmentInSupabase(id: string, status: AppointmentStatus, notes?: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const updatePayload: Record<string, any> = { status };
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }
    const { error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id);

    return !error;
  } catch (e) {
    return false;
  }
}

/**
 * Updates full appointment details in Supabase
 */
export async function updateAppointmentFullInSupabase(id: string, updates: Partial<Appointment>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, any> = {};
    if (updates.patient_name !== undefined) payload.patient_name = updates.patient_name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email || null;
    if (updates.service_id !== undefined) payload.service_id = updates.service_id;
    if (updates.service_name !== undefined) payload.service_name = updates.service_name;
    if (updates.appointment_date !== undefined) payload.appointment_date = updates.appointment_date;
    if (updates.appointment_time !== undefined) payload.appointment_time = updates.appointment_time;
    if (updates.message !== undefined) payload.message = updates.message || null;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes || null;

    const { error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id);

    return !error;
  } catch (e) {
    console.warn('Failed to update appointment in Supabase:', e);
    return false;
  }
}

/**
 * Deletes appointment in Supabase
 */
export async function deleteAppointmentInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    return !error;
  } catch (e) {
    return false;
  }
}

/**
 * Subscribes to real-time changes on the Supabase appointments table
 */
export function subscribeToAppointments(
  onInsert?: (appointment: Appointment) => void,
  onUpdate?: (appointment: Appointment) => void,
  onDelete?: (id: string) => void
): (() => void) | null {
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('appointments_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          if (onInsert && payload.new) {
            onInsert({ ...(payload.new as Appointment), supabase_synced: true });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments' },
        (payload) => {
          if (onUpdate && payload.new) {
            onUpdate({ ...(payload.new as Appointment), supabase_synced: true });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'appointments' },
        (payload) => {
          if (onDelete && payload.old && (payload.old as any).id) {
            onDelete((payload.old as any).id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}
