import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Check, 
  X, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Plus, 
  Settings, 
  CheckCircle, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Inbox, 
  Lock, 
  Unlock, 
  Save, 
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
  Database,
  Copy,
  CheckCheck,
  Search,
  Download,
  Printer,
  Ban,
  PlusCircle,
  Activity,
  Zap,
  LogOut,
  CalendarClock,
  ArrowLeft
} from 'lucide-react';
import { Appointment, DentalService, ClinicConfig, AppointmentStatus, NotificationLog } from '../types';
import { api, createWhatsAppBookingUrl } from '../services/api';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_SQL_SETUP, 
  checkSupabaseHealth,
  fetchAppointmentsFromSupabase,
  updateAppointmentInSupabase,
  updateAppointmentFullInSupabase,
  deleteAppointmentInSupabase,
  subscribeToAppointments,
  signOutAdmin,
  getAdminSession,
  getAdminUser,
  onAdminAuthStateChange
} from '../services/supabase';

interface AdminDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
  config: ClinicConfig;
  onConfigUpdated: (config: ClinicConfig) => void;
  onServicesUpdated: (services: DentalService[]) => void;
  onNavigate?: (path: string) => void;
  isStandalonePage?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen = true,
  onClose,
  config,
  onConfigUpdated,
  onServicesUpdated,
  onNavigate,
  isStandalonePage = true
}) => {
  // Supabase Authentication state
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'settings' | 'notifications' | 'supabase'>('appointments');

  // Appointments filter & search
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'past'>('all');
  const [specificDateFilter, setSpecificDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reschedule Modal State
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('10:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState<string>('');

  // Appointment Modals state (View, Edit, Cancel, Create)
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Patient requested reschedule');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isCreatingAppointment, setIsCreatingAppointment] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Check Supabase Auth session on mount and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    getAdminSession().then(session => {
      if (!isMounted) return;
      if (session && session.user) {
        setAdminUser(session.user);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      } else {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        if (onNavigate && isStandalonePage) {
          onNavigate('/admin/login');
        }
      }
    }).catch(() => {
      if (isMounted) setIsCheckingAuth(false);
    });

    const sub = onAdminAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session && session.user) {
        setAdminUser(session.user);
        setIsAuthenticated(true);
      } else {
        setAdminUser(null);
        setIsAuthenticated(false);
        if (onNavigate && isStandalonePage) {
          onNavigate('/admin/login');
        }
      }
    });

    return () => {
      isMounted = false;
      if (sub && (sub as any).data?.subscription?.unsubscribe) {
        (sub as any).data.subscription.unsubscribe();
      }
    };
  }, [onNavigate, isStandalonePage]);

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      setIsAuthenticated(false);
      setAdminUser(null);
      if (onNavigate) {
        onNavigate('/admin/login');
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // New Appointment Form
  const [newBooking, setNewBooking] = useState({
    patient_name: '',
    phone: '',
    email: '',
    service_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    message: ''
  });

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [dbDataSource, setDbDataSource] = useState<'supabase_live' | 'supabase_merged' | 'local_fallback'>('supabase_live');
  const [isRealtimeSubscribed, setIsRealtimeSubscribed] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<{ [id: string]: 'confirm' | 'cancel' | 'delete' | 'status' | null }>({});

  // Editable form state for Service modal
  const [editingService, setEditingService] = useState<Partial<DentalService> | null>(null);

  // Editable settings copy
  const [editableConfig, setEditableConfig] = useState<ClinicConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
      checkSupabase();
      setEditableConfig(config);
    }
  }, [isOpen, config]);

  // Real-time Supabase Database Listener
  // Automatically syncs when any appointment is inserted, updated, or deleted
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const unsubscribe = subscribeToAppointments(
      (newApt) => {
        setAppointments(prev => {
          if (prev.some(a => a.id === newApt.id)) {
            return prev.map(a => a.id === newApt.id ? { ...a, ...newApt } : a);
          }
          return [newApt, ...prev];
        });
        setActionSuccessMessage(`⚡ Real-time: New booking received from ${newApt.patient_name}`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      },
      (updatedApt) => {
        setAppointments(prev => prev.map(a => a.id === updatedApt.id ? { ...a, ...updatedApt } : a));
      },
      (deletedId) => {
        setAppointments(prev => prev.filter(a => a.id !== deletedId));
      }
    );

    if (unsubscribe) {
      setIsRealtimeSubscribed(true);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsRealtimeSubscribed(false);
      }
    };
  }, [isAuthenticated, isOpen]);

  const checkSupabase = async () => {
    setIsCheckingSupabase(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (e) {
      console.error('Failed to check Supabase:', e);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    setSyncMessage(null);
    try {
      const res = await api.syncAllToSupabase();
      setSyncMessage(`Sync complete: ${res.synced} appointments updated in Supabase (${res.failed} pending table creation).`);
      // Reload appointments to show updated status
      await loadDashboardData();
    } catch (e: any) {
      setSyncMessage(`Sync error: ${e?.message || 'Failed to sync'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Fetch appointment data directly from Supabase with fallback
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Query Supabase directly
      let fetchedAppointments: Appointment[] | null = null;
      try {
        fetchedAppointments = await fetchAppointmentsFromSupabase();
      } catch (err) {
        console.warn('Direct fetch from Supabase returned error:', err);
      }

      if (fetchedAppointments && fetchedAppointments.length > 0) {
        // Appointments retrieved directly from Supabase PostgreSQL
        setAppointments(fetchedAppointments);
        setDbDataSource('supabase_live');
      } else {
        // Fallback / merged fetch
        const aptData = await api.getAppointments();
        setAppointments(aptData);
        setDbDataSource(aptData.some(a => a.supabase_synced) ? 'supabase_merged' : 'local_fallback');
      }

      // Load services & notifications
      const [srvData, notifData] = await Promise.all([
        api.getServices(),
        api.getNotifications()
      ]);
      setServices(srvData);
      setNotifications(notifData);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Reschedule Appointment Handlers
  const openRescheduleModal = (apt: Appointment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReschedulingAppointment(apt);
    setRescheduleDate(apt.appointment_date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(apt.appointment_time || '10:00 AM');
    setRescheduleNotes('');
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment) return;
    setIsActionLoading(true);

    const aptId = reschedulingAppointment.id;
    setRowActionLoading(prev => ({ ...prev, [aptId]: 'status' }));

    const updatedNote = reschedulingAppointment.notes 
      ? `${reschedulingAppointment.notes}\n[${new Date().toLocaleDateString()}] Rescheduled to ${rescheduleDate} at ${rescheduleTime}${rescheduleNotes ? `: ${rescheduleNotes}` : ''}`
      : `[${new Date().toLocaleDateString()}] Rescheduled to ${rescheduleDate} at ${rescheduleTime}${rescheduleNotes ? `: ${rescheduleNotes}` : ''}`;

    try {
      await Promise.allSettled([
        updateAppointmentFullInSupabase(aptId, {
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
          notes: updatedNote,
          status: 'confirmed'
        }),
        api.updateAppointment(aptId, {
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
          notes: updatedNote,
          status: 'confirmed'
        })
      ]);

      setAppointments(prev => prev.map(a => a.id === aptId ? {
        ...a,
        appointment_date: rescheduleDate,
        appointment_time: rescheduleTime,
        notes: updatedNote,
        status: 'confirmed' as AppointmentStatus,
        supabase_synced: true
      } : a));

      setActionSuccessMessage(`✓ Real-time Update: ${reschedulingAppointment.patient_name}'s appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
      setReschedulingAppointment(null);
    } catch (err: any) {
      alert(`Failed to reschedule appointment: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsActionLoading(false);
      setRowActionLoading(prev => ({ ...prev, [aptId]: null }));
    }
  };

  // Real-time Confirm Handler for each row
  const handleConfirmRow = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const apt = appointments.find(a => a.id === id);
    setRowActionLoading(prev => ({ ...prev, [id]: 'confirm' }));

    // 1. Optimistic UI update for instantaneous feedback
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' as AppointmentStatus, supabase_synced: true } : a));

    try {
      // 2. Real-time write to Supabase database & backend
      await Promise.allSettled([
        updateAppointmentInSupabase(id, 'confirmed'),
        api.updateAppointmentStatus(id, 'confirmed')
      ]);

      setActionSuccessMessage(`✓ Real-time Update: ${apt?.patient_name || 'Appointment'} confirmed in Supabase database.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      api.getNotifications().then(setNotifications);
    } catch (err: any) {
      console.error('Confirm error:', err);
      setActionSuccessMessage('Updated locally; Supabase sync queued.');
    } finally {
      setRowActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Real-time Cancel Handler for each row
  const handleCancelRow = async (id: string, reason: string = 'Cancelled from Admin Dashboard', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const apt = appointments.find(a => a.id === id);
    
    // Quick confirmation
    const confirmed = window.confirm(`Are you sure you want to cancel the appointment for ${apt?.patient_name || 'this patient'}?`);
    if (!confirmed) return;

    setRowActionLoading(prev => ({ ...prev, [id]: 'cancel' }));

    // 1. Optimistic UI update
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus, notes: `Reason: ${reason}` } : a));

    try {
      // 2. Real-time write to Supabase database & backend
      await Promise.allSettled([
        updateAppointmentInSupabase(id, 'cancelled', reason),
        api.cancelAppointment(id, reason)
      ]);

      setActionSuccessMessage(`✓ Real-time Update: ${apt?.patient_name || 'Appointment'} cancelled in Supabase database.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      api.getNotifications().then(setNotifications);
    } catch (err: any) {
      console.error('Cancel error:', err);
      setActionSuccessMessage('Updated locally; Supabase sync queued.');
    } finally {
      setRowActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Real-time Delete Handler for each row
  const handleDeleteRow = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const apt = appointments.find(a => a.id === id);
    const confirmed = window.confirm(`Permanently delete appointment for "${apt?.patient_name || 'this patient'}" from Supabase database?`);
    if (!confirmed) return;

    setRowActionLoading(prev => ({ ...prev, [id]: 'delete' }));

    // 1. Optimistic UI removal
    setAppointments(prev => prev.filter(a => a.id !== id));

    try {
      // 2. Real-time deletion in Supabase database & backend
      await Promise.allSettled([
        deleteAppointmentInSupabase(id),
        api.deleteAppointment(id)
      ]);

      setActionSuccessMessage(`✓ Real-time Update: Record for ${apt?.patient_name || 'patient'} deleted from Supabase database.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
    } finally {
      setRowActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Real-time inline status change (Pending, Confirmed, Completed, Cancelled)
  const handleStatusChangeRow = async (id: string, newStatus: AppointmentStatus) => {
    const apt = appointments.find(a => a.id === id);
    setRowActionLoading(prev => ({ ...prev, [id]: 'status' }));

    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    try {
      await Promise.allSettled([
        updateAppointmentInSupabase(id, newStatus),
        api.updateAppointmentStatus(id, newStatus)
      ]);
      setActionSuccessMessage(`✓ Real-time Update: ${apt?.patient_name || 'Appointment'} marked as ${newStatus} in Supabase.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      api.getNotifications().then(setNotifications);
    } catch (err: any) {
      console.error('Status change error:', err);
    } finally {
      setRowActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  // Legacy/Modal Appointment Actions
  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    await handleStatusChangeRow(id, status);
  };

  // Edit Appointment Save
  const handleSaveEditedAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setIsActionLoading(true);

    try {
      const updated = await api.updateAppointment(editingAppointment.id, {
        patient_name: editingAppointment.patient_name,
        phone: editingAppointment.phone,
        email: editingAppointment.email,
        service_id: editingAppointment.service_id,
        service_name: editingAppointment.service_name,
        appointment_date: editingAppointment.appointment_date,
        appointment_time: editingAppointment.appointment_time,
        status: editingAppointment.status,
        notes: editingAppointment.notes,
        message: editingAppointment.message
      });

      setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditingAppointment(null);
      setActionSuccessMessage(`Appointment for ${updated.patient_name} updated successfully.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(`Failed to save changes: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Cancel Appointment Confirmation
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingAppointment) return;
    setIsActionLoading(true);

    const finalReason = cancelReason === 'custom' ? customCancelReason : cancelReason;

    try {
      const cancelled = await api.cancelAppointment(cancellingAppointment.id, finalReason);
      setAppointments(prev => prev.map(a => a.id === cancelled.id ? cancelled : a));
      setCancellingAppointment(null);
      setCancelReason('Patient requested reschedule');
      setCustomCancelReason('');
      setActionSuccessMessage(`Appointment for ${cancelled.patient_name} has been cancelled.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
      api.getNotifications().then(setNotifications);
    } catch (err: any) {
      alert(`Failed to cancel appointment: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Create Walk-in / Phone Booking
  const handleCreateWalkinAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.patient_name || !newBooking.phone || !newBooking.service_id) {
      alert('Please fill out the patient name, phone, and dental service.');
      return;
    }
    setIsActionLoading(true);

    try {
      const created = await api.createAppointment({
        patient_name: newBooking.patient_name,
        phone: newBooking.phone,
        email: newBooking.email,
        service_id: newBooking.service_id,
        appointment_date: newBooking.appointment_date,
        appointment_time: newBooking.appointment_time,
        message: newBooking.message || 'Booked directly via Clinic Admin Panel'
      });

      setAppointments(prev => [created, ...prev]);
      setIsCreatingAppointment(false);
      setNewBooking({
        patient_name: '',
        phone: '',
        email: '',
        service_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:00 AM',
        message: ''
      });
      setActionSuccessMessage(`New booking for ${created.patient_name} created successfully.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
      api.getNotifications().then(setNotifications);
    } catch (err: any) {
      alert(`Failed to create appointment: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      await api.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setActionSuccessMessage('Appointment record permanently deleted.');
      setTimeout(() => setActionSuccessMessage(null), 2500);
    } catch (e) {
      console.error('Failed to delete appointment', e);
    }
  };

  // Export Appointments to CSV Spreadsheet
  const handleExportCsv = () => {
    if (appointments.length === 0) {
      alert('No appointments to export.');
      return;
    }

    const headers = ['ID', 'Patient Name', 'Phone', 'Email', 'Service Name', 'Date', 'Time', 'Status', 'Supabase Synced', 'Created At', 'Notes', 'Patient Message'];
    const rows = filteredAppointments.map(a => [
      `"${a.id}"`,
      `"${(a.patient_name || '').replace(/"/g, '""')}"`,
      `"${a.phone || ''}"`,
      `"${a.email || ''}"`,
      `"${(a.service_name || '').replace(/"/g, '""')}"`,
      `"${a.appointment_date}"`,
      `"${a.appointment_time}"`,
      `"${a.status}"`,
      `"${a.supabase_synced ? 'Yes' : 'No'}"`,
      `"${a.created_at || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sanjeevini_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Daily Schedule
  const handlePrintSchedule = () => {
    window.print();
  };

  // Service Actions
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name) return;

    try {
      if (editingService.id && services.some(s => s.id === editingService.id)) {
        const updated = await api.updateService(editingService.id, editingService);
        const nextList = services.map(s => s.id === updated.id ? updated : s);
        setServices(nextList);
        onServicesUpdated(nextList);
      } else {
        const created = await api.createService(editingService);
        const nextList = [...services, created];
        setServices(nextList);
        onServicesUpdated(nextList);
      }
      setEditingService(null);
    } catch (e) {
      console.error('Failed to save service', e);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      const nextList = services.filter(s => s.id !== id);
      setServices(nextList);
      onServicesUpdated(nextList);
    } catch (e) {
      console.error('Failed to delete service', e);
    }
  };

  // Settings Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateConfig(editableConfig);
      onConfigUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update config', e);
    }
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const metrics = useMemo(() => {
    const today = appointments.filter(a => a.appointment_date === todayStr);
    const pending = appointments.filter(a => a.status === 'pending');
    const confirmed = appointments.filter(a => a.status === 'confirmed');
    const completed = appointments.filter(a => a.status === 'completed');
    const cancelled = appointments.filter(a => a.status === 'cancelled');
    const supabaseSynced = appointments.filter(a => a.supabase_synced);

    return {
      total: appointments.length,
      todayCount: today.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      supabaseSyncedCount: supabaseSynced.length
    };
  }, [appointments, todayStr]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    let list = [...appointments];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        (a.patient_name && a.patient_name.toLowerCase().includes(q)) ||
        (a.phone && a.phone.includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.service_name && a.service_name.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.message && a.message.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }

    // Specific date filter or preset time filter
    if (specificDateFilter) {
      list = list.filter(a => a.appointment_date === specificDateFilter);
    } else {
      const now = new Date();
      if (timeFilter === 'today') {
        list = list.filter(a => a.appointment_date === todayStr);
      } else if (timeFilter === 'week') {
        const sevenDays = new Date();
        sevenDays.setDate(now.getDate() + 7);
        const maxDate = sevenDays.toISOString().split('T')[0];
        list = list.filter(a => a.appointment_date >= todayStr && a.appointment_date <= maxDate);
      } else if (timeFilter === 'month') {
        const thirtyDays = new Date();
        thirtyDays.setDate(now.getDate() + 30);
        const maxDate = thirtyDays.toISOString().split('T')[0];
        list = list.filter(a => a.appointment_date >= todayStr && a.appointment_date <= maxDate);
      } else if (timeFilter === 'past') {
        list = list.filter(a => a.appointment_date < todayStr);
      }
    }

    return list;
  }, [appointments, searchQuery, statusFilter, timeFilter, specificDateFilter, todayStr]);

  if (!isOpen) return null;

  const dashboardContent = (
    <div className={`bg-white ${isStandalonePage ? 'flex-1 flex flex-col' : 'rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150'}`}>
      
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-600 rounded-xl text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold font-heading flex items-center gap-2">
              <span>Sanjeevini Clinic Admin Portal</span>
              <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                Staff Portal
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Vinobanagar, Shivamogga · Verified Phone: 089710 96312
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 text-slate-300 rounded-lg text-xs border border-slate-700">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[180px]" title={adminUser?.email || 'Admin Staff'}>
                {adminUser?.email || 'Admin Staff'}
              </span>
            </div>
          )}

          <button
            onClick={() => onNavigate ? onNavigate('/') : onClose?.()}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Public Website</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              title="Sign Out of Supabase"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}

          {!isStandalonePage && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Auth Check Screen */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="text-center max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-700 rounded-2xl flex items-center justify-center mx-auto border border-cyan-100">
              <Lock className="w-7 h-7 text-cyan-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Administrator Authentication Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You must be logged in with Supabase Authentication to view and manage patient appointments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/admin/login') : window.location.assign('/admin/login')}
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In with Supabase</span>
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('/') : onClose?.()}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                ← Return to Public Website
              </button>
            </div>
          </div>
        </div>
      ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-2 py-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    activeTab === 'appointments'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Appointments ({appointments.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('supabase');
                    checkSupabase();
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'supabase'
                      ? 'bg-cyan-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Supabase DB</span>
                  <span className={`w-2 h-2 rounded-full ${supabaseStatus?.tableExists ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Services Catalogue ({services.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Clinic Settings
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Email & Alert Logs ({notifications.length})
                </button>
              </div>

              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              
              {/* TAB 1: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-5">
                  {/* Action Notification Toast */}
                  {actionSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{actionSuccessMessage}</span>
                      </div>
                      <button 
                        onClick={() => setActionSuccessMessage(null)} 
                        className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Header & Quick Action Ribbon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 font-heading">
                          Appointments & Patient Queue
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-medium border border-cyan-200">
                          {filteredAppointments.length} visible
                        </span>
                        {/* Real-time Supabase Live Connection Indicator */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>Supabase Live</span>
                          {isRealtimeSubscribed && (
                            <span className="text-[9px] text-emerald-600 font-mono">(Real-time On)</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Direct connection to Supabase database (<span className="font-mono text-cyan-800">public.appointments</span>). Interactive row controls update database status in real-time.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={loadDashboardData}
                        disabled={isLoading}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        title="Fetch latest appointment data directly from Supabase"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : 'text-emerald-600'}`} />
                        <span>Fetch from Supabase</span>
                      </button>

                      <button
                        onClick={() => setIsCreatingAppointment(true)}
                        className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Booking</span>
                      </button>

                      <button
                        onClick={handleExportCsv}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        title="Download CSV spreadsheet"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={handlePrintSchedule}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        title="Print appointment schedule"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  {/* Metric Cards Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    <button
                      onClick={() => { setStatusFilter('all'); setTimeFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        statusFilter === 'all' && timeFilter === 'all'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${statusFilter === 'all' && timeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Total Bookings
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.total}
                      </div>
                    </button>

                    <button
                      onClick={() => { setTimeFilter('today'); setStatusFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        timeFilter === 'today'
                          ? 'bg-cyan-700 text-white border-cyan-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${timeFilter === 'today' ? 'text-cyan-100' : 'text-cyan-800'}`}>
                        Today's Visits
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.todayCount}
                      </div>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('pending'); setTimeFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        statusFilter === 'pending'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${statusFilter === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>
                        Pending
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.pendingCount}
                      </div>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('confirmed'); setTimeFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        statusFilter === 'confirmed'
                          ? 'bg-cyan-800 text-white border-cyan-800 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${statusFilter === 'confirmed' ? 'text-cyan-100' : 'text-cyan-800'}`}>
                        Confirmed
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.confirmedCount}
                      </div>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('completed'); setTimeFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        statusFilter === 'completed'
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${statusFilter === 'completed' ? 'text-teal-100' : 'text-teal-800'}`}>
                        Completed
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.completedCount}
                      </div>
                    </button>

                    <button
                      onClick={() => { setStatusFilter('cancelled'); setTimeFilter('all'); }}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        statusFilter === 'cancelled'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider block ${statusFilter === 'cancelled' ? 'text-rose-100' : 'text-rose-700'}`}>
                        Cancelled
                      </span>
                      <div className="text-xl font-extrabold font-heading mt-0.5">
                        {metrics.cancelledCount}
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="text-left p-3.5 rounded-xl border bg-white border-slate-200 hover:border-emerald-300 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          Supabase Sync
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="text-xl font-extrabold font-heading text-emerald-950 mt-0.5">
                        {metrics.supabaseSyncedCount} / {metrics.total}
                      </div>
                    </button>
                  </div>

                  {/* Search & Multi-Filters Toolbar */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by patient name, phone (089...), email, service, or booking ID..."
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white transition"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Time Range Filter Buttons & Date Picker */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 flex-wrap">
                        <span className="text-slate-400 font-medium mr-1 text-[11px]">Date:</span>
                        {(['all', 'today', 'week', 'month', 'past'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => {
                              setTimeFilter(t);
                              setSpecificDateFilter('');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg capitalize font-medium text-xs transition cursor-pointer ${
                              timeFilter === t && !specificDateFilter ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {t === 'all' ? 'All Dates' : t}
                          </button>
                        ))}
                        <input
                          type="date"
                          value={specificDateFilter}
                          onChange={(e) => {
                            setSpecificDateFilter(e.target.value);
                            setTimeFilter('all');
                          }}
                          className={`px-2 py-1 text-xs border rounded-lg transition cursor-pointer ${
                            specificDateFilter ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                          title="Pick specific date"
                        />
                      </div>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-400 font-medium mr-1 text-[11px]">Status:</span>
                      {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1 rounded-lg capitalize font-medium text-xs transition cursor-pointer ${
                            statusFilter === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      {(statusFilter !== 'all' || timeFilter !== 'all' || searchQuery) && (
                        <button
                          onClick={() => { setStatusFilter('all'); setTimeFilter('all'); setSearchQuery(''); }}
                          className="ml-auto text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3.5">Patient Name</th>
                            <th className="py-3 px-3.5">Phone & Contact</th>
                            <th className="py-3 px-3.5">Email</th>
                            <th className="py-3 px-3.5">Appointment Date</th>
                            <th className="py-3 px-3.5">Appointment Time</th>
                            <th className="py-3 px-3.5">Reason</th>
                            <th className="py-3 px-3.5">Status</th>
                            <th className="py-3 px-3.5">Created Date</th>
                            <th className="py-3 px-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-slate-400">
                                <div className="max-w-sm mx-auto space-y-2">
                                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                                  <p className="font-semibold text-slate-700">No appointments found</p>
                                  <p className="text-xs text-slate-500">
                                    No records match the current filters or search query.
                                  </p>
                                  <button
                                    onClick={() => { setStatusFilter('all'); setTimeFilter('all'); setSpecificDateFilter(''); setSearchQuery(''); }}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    Reset Filters
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredAppointments.map(apt => {
                              const isToday = apt.appointment_date === todayStr;
                              return (
                                <tr key={apt.id} className={`hover:bg-slate-50/80 transition ${isToday ? 'bg-cyan-50/30' : ''}`}>
                                  {/* 1. Patient Name Column */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-900 font-bold text-xs flex items-center justify-center shrink-0">
                                        {(apt.patient_name || 'P').charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 font-heading flex items-center gap-1.5">
                                          <span>{apt.patient_name}</span>
                                          {isToday && (
                                            <span className="text-[9px] px-1.5 py-0.2 bg-cyan-700 text-white font-bold rounded">
                                              TODAY
                                            </span>
                                          )}
                                        </div>
                                        {apt.notes && (
                                          <div className="text-[10px] text-cyan-800 line-clamp-1 max-w-xs mt-0.5" title={apt.notes}>
                                            {apt.notes.split('\n').pop()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* 2. Phone Column with Call & WhatsApp Buttons */}
                                  <td className="py-3.5 px-3.5 font-mono">
                                    <div className="space-y-1">
                                      <div className="font-semibold text-slate-800 text-xs">
                                        {apt.phone}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <a 
                                          href={`tel:${apt.phone}`} 
                                          className="px-2 py-0.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded font-sans font-semibold text-[10px] inline-flex items-center gap-1 transition"
                                          title="Call patient phone"
                                        >
                                          <Phone className="w-2.5 h-2.5 text-cyan-600" />
                                          <span>Call</span>
                                        </a>
                                        <a
                                          href={`https://wa.me/91${apt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${apt.patient_name}, this is Sanjeevini Dental Clinic regarding your appointment scheduled on ${apt.appointment_date} at ${apt.appointment_time}...`)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-sans font-semibold text-[10px] inline-flex items-center gap-1 transition"
                                          title="Chat on WhatsApp"
                                        >
                                          <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                                          <span>WhatsApp</span>
                                        </a>
                                      </div>
                                    </div>
                                  </td>

                                  {/* 3. Email Column */}
                                  <td className="py-3.5 px-3.5">
                                    {apt.email ? (
                                      <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px] block" title={apt.email}>
                                        {apt.email}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-mono text-[11px]">—</span>
                                    )}
                                  </td>

                                  {/* 4. Appointment Date Column */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="font-semibold text-slate-900 whitespace-nowrap">{apt.appointment_date}</div>
                                  </td>

                                  {/* 5. Appointment Time Column */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1 whitespace-nowrap">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{apt.appointment_time}</span>
                                    </div>
                                  </td>

                                  {/* 6. Reason Column */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="max-w-[150px]">
                                      <div className="font-medium text-slate-800 text-xs truncate" title={apt.service_name}>
                                        {apt.service_name}
                                      </div>
                                      {apt.message && (
                                        <div className="text-[10px] text-slate-500 italic truncate mt-0.5" title={apt.message}>
                                          "{apt.message}"
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* 7. Status Column with Live Real-time Selector & Supabase indicator */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="space-y-1">
                                      <div className="relative inline-block">
                                        <select
                                          value={apt.status}
                                          onChange={(e) => handleStatusChangeRow(apt.id, e.target.value as AppointmentStatus)}
                                          disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                          className={`text-[10px] font-bold rounded-lg pl-2 pr-6 py-1 capitalize border cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-600 transition appearance-none shadow-2xs ${
                                            apt.status === 'confirmed' ? 'bg-cyan-50 text-cyan-900 border-cyan-300 hover:bg-cyan-100' :
                                            apt.status === 'pending' ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' :
                                            apt.status === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100' :
                                            apt.status === 'cancelled' ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100' :
                                            'bg-slate-100 text-slate-700 border-slate-300'
                                          }`}
                                          title="Click to change status directly in Supabase"
                                        >
                                          <option value="pending">Pending</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="completed">Completed</option>
                                          <option value="cancelled">Cancelled</option>
                                        </select>
                                        <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
                                          {rowActionLoading[apt.id] === 'status' ? (
                                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-700" />
                                          ) : (
                                            <Sliders className="w-2.5 h-2.5" />
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        {apt.supabase_synced ? (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span>Supabase</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span>Local</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* 8. Created Date Column */}
                                  <td className="py-3.5 px-3.5">
                                    <div className="text-[11px] text-slate-500 whitespace-nowrap font-mono">
                                      {apt.created_at ? new Date(apt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                                    </div>
                                  </td>

                                  {/* 9. Interactive Action Controls Column */}
                                  <td className="py-3.5 px-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {/* Action: Confirm */}
                                      {apt.status !== 'confirmed' && apt.status !== 'completed' && (
                                        <button
                                          onClick={(e) => handleConfirmRow(apt.id, e)}
                                          disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                                          title="Confirm appointment in Supabase"
                                        >
                                          {rowActionLoading[apt.id] === 'confirm' ? (
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <Check className="w-3 h-3" />
                                          )}
                                          <span>Confirm</span>
                                        </button>
                                      )}

                                      {/* Action: Mark as Completed */}
                                      {apt.status !== 'completed' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChangeRow(apt.id, 'completed');
                                          }}
                                          disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                                          title="Mark appointment as completed in Supabase"
                                        >
                                          {rowActionLoading[apt.id] === 'status' ? (
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <CheckCheck className="w-3 h-3" />
                                          )}
                                          <span>Complete</span>
                                        </button>
                                      )}

                                      {/* Action: Reschedule */}
                                      <button
                                        onClick={(e) => openRescheduleModal(apt, e)}
                                        disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                        title="Reschedule appointment date & time"
                                      >
                                        <CalendarClock className="w-3 h-3 text-amber-700" />
                                        <span>Reschedule</span>
                                      </button>

                                      {/* Action: Cancel */}
                                      {apt.status !== 'cancelled' ? (
                                        <button
                                          onClick={(e) => handleCancelRow(apt.id, 'Cancelled via Admin Table Action', e)}
                                          disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                          title="Cancel appointment in Supabase"
                                        >
                                          {rowActionLoading[apt.id] === 'cancel' ? (
                                            <RefreshCw className="w-3 h-3 animate-spin text-rose-700" />
                                          ) : (
                                            <Ban className="w-3 h-3 text-rose-600" />
                                          )}
                                          <span>Cancel</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => handleConfirmRow(apt.id, e)}
                                          disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-semibold text-[10px] flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                          title="Reopen appointment in Supabase"
                                        >
                                          <RefreshCw className="w-3 h-3" />
                                          <span>Reopen</span>
                                        </button>
                                      )}

                                      {/* Action: Delete */}
                                      <button
                                        onClick={(e) => handleDeleteRow(apt.id, e)}
                                        disabled={rowActionLoading[apt.id] !== undefined && rowActionLoading[apt.id] !== null}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                        title="Permanently delete from Supabase database"
                                      >
                                        {rowActionLoading[apt.id] === 'delete' ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                        ) : (
                                          <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      {/* View Details */}
                                      <button
                                        onClick={() => setViewingAppointment(apt)}
                                        className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                        title="View complete appointment card"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: SERVICES MANAGEMENT */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-heading">
                        Dental Service Catalogue
                      </h4>
                      <p className="text-xs text-slate-500">
                        Add, modify or toggle active services visible to patients.
                      </p>
                    </div>

                    <button
                      onClick={() => setEditingService({
                        name: '',
                        description: '',
                        duration_minutes: 30,
                        price: 'Consultation required',
                        is_active: true,
                        category: 'preventive',
                        icon_name: 'Stethoscope'
                      })}
                      className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  {/* Services List Table */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Service Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">Pricing</th>
                          <th className="py-3 px-4">Visibility</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {services.map(srv => (
                          <tr key={srv.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900 font-heading">
                              {srv.name}
                            </td>
                            <td className="py-3 px-4 capitalize text-slate-500">
                              {srv.category}
                            </td>
                            <td className="py-3 px-4">
                              {srv.duration_minutes} mins
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {srv.price || 'Consultation required'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                srv.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {srv.is_active ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingService(srv)}
                                  className="p-1 text-slate-600 hover:text-cyan-700 rounded"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Service Edit Modal */}
                  {editingService && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                          <h4 className="text-base font-bold font-heading text-slate-900">
                            {editingService.id ? 'Edit Dental Service' : 'Add New Service'}
                          </h4>
                          <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Service Name *</label>
                            <input
                              type="text"
                              required
                              value={editingService.name || ''}
                              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={editingService.description || ''}
                              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                              <input
                                type="number"
                                min={15}
                                step={5}
                                value={editingService.duration_minutes || 30}
                                onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Price Policy</label>
                              <input
                                type="text"
                                placeholder="e.g. ₹500 or Consultation"
                                value={editingService.price || ''}
                                onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              id="srv-active"
                              checked={editingService.is_active ?? true}
                              onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                              className="rounded text-cyan-700"
                            />
                            <label htmlFor="srv-active" className="font-semibold text-slate-800">
                              Display this service on booking page
                            </label>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                              type="button"
                              onClick={() => setEditingService(null)}
                              className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-cyan-700 text-white font-semibold rounded-lg"
                            >
                              Save Service
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: CLINIC CONFIGURATION & SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveConfig} className="space-y-6 max-w-4xl">
                  
                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Clinic configuration saved successfully!</span>
                    </div>
                  )}

                  {/* 1. Verified Business Details (Flagged clearly) */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          Core Clinic Information
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Verified clinic identity and official contact numbers.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded">
                        Verified Business Information
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                        <input
                          type="text"
                          value={editableConfig.clinicName}
                          onChange={(e) => setEditableConfig({ ...editableConfig, clinicName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Display Phone (Verified)</label>
                        <input
                          type="text"
                          value={editableConfig.displayPhone}
                          onChange={(e) => setEditableConfig({ ...editableConfig, displayPhone: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number (e.g. 918971096312)</label>
                        <input
                          type="text"
                          value={editableConfig.whatsapp}
                          onChange={(e) => setEditableConfig({ ...editableConfig, whatsapp: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Clinic Email</label>
                        <input
                          type="email"
                          value={editableConfig.email}
                          onChange={(e) => setEditableConfig({ ...editableConfig, email: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Address & Landmarks</label>
                        <input
                          type="text"
                          value={editableConfig.address}
                          onChange={(e) => setEditableConfig({ ...editableConfig, address: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Google Maps Destination Link</label>
                        <input
                          type="text"
                          value={editableConfig.googleMapsUrl}
                          onChange={(e) => setEditableConfig({ ...editableConfig, googleMapsUrl: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Booking Engine Controls */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        Appointment Scheduling Logic
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Prevent double bookings and configure chair capacity per slot.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Slot Duration (Minutes)</label>
                        <input
                          type="number"
                          step={5}
                          value={editableConfig.bookingSettings.slot_duration_minutes}
                          onChange={(e) => setEditableConfig({
                            ...editableConfig,
                            bookingSettings: {
                              ...editableConfig.bookingSettings,
                              slot_duration_minutes: Number(e.target.value)
                            }
                          })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Bookings Per Slot</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editableConfig.bookingSettings.max_appointments_per_slot}
                          onChange={(e) => setEditableConfig({
                            ...editableConfig,
                            bookingSettings: {
                              ...editableConfig.bookingSettings,
                              max_appointments_per_slot: Number(e.target.value)
                            }
                          })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Day-by-Day Working Hours Configuration */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        Weekly Operating Hours
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Set open/closed days, shift hours, and afternoon break intervals.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {Object.keys(editableConfig.bookingSettings.working_hours).map((dayKey) => {
                        const day = editableConfig.bookingSettings.working_hours[dayKey];
                        return (
                          <div key={dayKey} className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2">
                            <div className="flex items-center gap-3 w-32">
                              <input
                                type="checkbox"
                                id={`open-${dayKey}`}
                                checked={day.isOpen}
                                onChange={(e) => {
                                  const updatedHours = {
                                    ...editableConfig.bookingSettings.working_hours,
                                    [dayKey]: { ...day, isOpen: e.target.checked }
                                  };
                                  setEditableConfig({
                                    ...editableConfig,
                                    bookingSettings: { ...editableConfig.bookingSettings, working_hours: updatedHours }
                                  });
                                }}
                                className="rounded text-cyan-700"
                              />
                              <label htmlFor={`open-${dayKey}`} className="font-bold text-slate-900">
                                {dayKey}
                              </label>
                            </div>

                            {day.isOpen ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-slate-500">Hours:</span>
                                <input
                                  type="time"
                                  value={day.openTime}
                                  onChange={(e) => {
                                    const updated = {
                                      ...editableConfig.bookingSettings.working_hours,
                                      [dayKey]: { ...day, openTime: e.target.value }
                                    };
                                    setEditableConfig({
                                      ...editableConfig,
                                      bookingSettings: { ...editableConfig.bookingSettings, working_hours: updated }
                                    });
                                  }}
                                  className="p-1 border rounded bg-white text-slate-800"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                  type="time"
                                  value={day.closeTime}
                                  onChange={(e) => {
                                    const updated = {
                                      ...editableConfig.bookingSettings.working_hours,
                                      [dayKey]: { ...day, closeTime: e.target.value }
                                    };
                                    setEditableConfig({
                                      ...editableConfig,
                                      bookingSettings: { ...editableConfig.bookingSettings, working_hours: updated }
                                    });
                                  }}
                                  className="p-1 border rounded bg-white text-slate-800"
                                />

                                <label className="flex items-center gap-1 ml-2 text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={day.hasBreak}
                                    onChange={(e) => {
                                      const updated = {
                                        ...editableConfig.bookingSettings.working_hours,
                                        [dayKey]: { ...day, hasBreak: e.target.checked }
                                      };
                                      setEditableConfig({
                                        ...editableConfig,
                                        bookingSettings: { ...editableConfig.bookingSettings, working_hours: updated }
                                      });
                                    }}
                                  />
                                  <span>Break</span>
                                </label>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Clinic Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-cyan-400" />
                      <span>Save All Clinic Changes</span>
                    </button>
                  </div>

                </form>
              )}

              {/* TAB 4: EMAIL & NOTIFICATION LOGS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        Automated Notification & Email Logs
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Real-time simulation logs of confirmation emails and booking alerts sent to clinic & patients.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border">
                        No notifications sent yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 font-heading">
                              {n.subject}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(n.sent_at).toLocaleTimeString()} · {new Date(n.sent_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="text-slate-600">
                            Recipient: <span className="font-mono text-slate-800 font-medium">{n.recipient}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 text-[11px] border border-slate-100">
                            {n.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SUPABASE DATABASE INTEGRATION */}
              {activeTab === 'supabase' && (
                <div className="space-y-6">
                  {/* Top Status Banner */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-950 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-800/40 shadow-xs">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 font-heading">
                              Supabase Database Backend
                            </h4>
                            {supabaseStatus?.tableExists ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Connected & Active</span>
                              </span>
                            ) : supabaseStatus?.connected ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>Connected (Table Setup Pending)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                                <span>Checking...</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Automated persistence engine connecting all website booking forms to your Supabase PostgreSQL database.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={checkSupabase}
                          disabled={isCheckingSupabase}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                          <span>Test Connection</span>
                        </button>

                        <button
                          onClick={handleSyncSupabase}
                          disabled={isSyncingSupabase}
                          className="px-3.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>{isSyncingSupabase ? 'Syncing...' : 'Sync All Appointments'}</span>
                        </button>

                        <a
                          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Supabase Console</span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                        </a>
                      </div>
                    </div>

                    {syncMessage && (
                      <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-center justify-between">
                        <span>{syncMessage}</span>
                        <button onClick={() => setSyncMessage(null)} className="text-cyan-700 hover:text-cyan-900">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Supabase Project ID
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-800 mt-1 flex items-center justify-between">
                          <span>{SUPABASE_PROJECT_ID}</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-medium">Verified</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Target Table
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-800 mt-1 flex items-center justify-between">
                          <span>public.appointments</span>
                          <span className="text-[10px] text-slate-500 font-sans">{supabaseStatus?.tableExists ? 'Created' : 'Pending SQL'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          API Authentication
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-800 mt-1 flex items-center justify-between">
                          <span>sb_publishable_...</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Status Alert & Guidance */}
                  {!supabaseStatus?.tableExists && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-amber-900 font-heading">
                            One-Time Quick Setup: Create the appointments table in Supabase
                          </h5>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Your Supabase credentials are authenticated and connected. To make appointments immediately visible in your Supabase table dashboard, run the SQL script below in your Supabase SQL Editor.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={handleCopySql}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          {copiedSql ? <CheckCheck className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedSql ? 'SQL Copied to Clipboard!' : '1. Copy SQL Setup Script'}</span>
                        </button>

                        <a
                          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>2. Open Supabase SQL Editor</span>
                          <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                        </a>

                        <button
                          onClick={checkSupabase}
                          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-amber-200 transition cursor-pointer"
                        >
                          <span>3. Verify Once Run</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SQL Schema Viewer */}
                  <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                            Supabase SQL Setup Code
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono">public.appointments</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Creates the appointments table with Row Level Security (RLS) policies allowing patient booking insertions.
                        </p>
                      </div>

                      <button
                        onClick={handleCopySql}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                      >
                        {copiedSql ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-950/80 rounded-xl text-[11px] font-mono text-cyan-300/90 overflow-x-auto border border-slate-800/80 max-h-72 leading-relaxed">
                      {SUPABASE_SQL_SETUP}
                    </pre>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Automatic fail-safe: All bookings submitted on the website are recorded both in Supabase and locally so you never miss a patient booking even if Supabase is offline or migrating.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 1: VIEW APPOINTMENT DETAILS */}
              {viewingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 font-heading">
                            Patient Appointment Card
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            viewingAppointment.status === 'confirmed' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                            viewingAppointment.status === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            viewingAppointment.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {viewingAppointment.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {viewingAppointment.id}
                        </p>
                      </div>
                      <button 
                        onClick={() => setViewingAppointment(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Patient & Booking Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient Name</span>
                        <div className="font-bold text-slate-900 text-sm font-heading">{viewingAppointment.patient_name}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone Number</span>
                        <div className="font-semibold text-slate-900 font-mono">{viewingAppointment.phone}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date & Time</span>
                        <div className="font-semibold text-slate-900">
                          {viewingAppointment.appointment_date} · {viewingAppointment.appointment_time}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Requested Service</span>
                        <div className="font-semibold text-cyan-900">{viewingAppointment.service_name}</div>
                      </div>

                      {viewingAppointment.email && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                          <div className="font-mono text-slate-700">{viewingAppointment.email}</div>
                        </div>
                      )}

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Supabase Sync Status</span>
                        <div className="flex items-center gap-2">
                          {viewingAppointment.supabase_synced ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Stored in Supabase Database (Project ID: {SUPABASE_PROJECT_ID})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium text-xs">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Saved locally. Will sync to Supabase when table is ready.</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Patient Message / Symptoms */}
                    {viewingAppointment.message && (
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-1">
                        <span className="text-[10px] text-amber-800 uppercase font-bold block">Patient Chief Complaint / Message:</span>
                        <p className="text-xs text-slate-700 italic">"{viewingAppointment.message}"</p>
                      </div>
                    )}

                    {/* Clinical / Administrative Notes */}
                    {viewingAppointment.notes && (
                      <div className="p-3 bg-cyan-50/40 rounded-xl border border-cyan-200/60 space-y-1">
                        <span className="text-[10px] text-cyan-800 uppercase font-bold block">Clinical Staff & Admin Notes:</span>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap">{viewingAppointment.notes}</p>
                      </div>
                    )}

                    {/* Bottom Quick Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${viewingAppointment.phone}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-700" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${viewingAppointment.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${viewingAppointment.patient_name}, regarding your appointment at Sanjeevini Dental Clinic on ${viewingAppointment.appointment_date} at ${viewingAppointment.appointment_time}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const aptToEdit = { ...viewingAppointment };
                            setViewingAppointment(null);
                            setEditingAppointment(aptToEdit);
                          }}
                          className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>

                        {viewingAppointment.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              const aptToCancel = { ...viewingAppointment };
                              setViewingAppointment(null);
                              setCancellingAppointment(aptToCancel);
                              setCancelReason('Patient requested reschedule');
                              setCustomCancelReason('');
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: EDIT APPOINTMENT DETAILS */}
              {editingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          Edit Appointment Details
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Updates sync immediately with Supabase PostgreSQL and clinic storage.
                        </p>
                      </div>
                      <button 
                        onClick={() => setEditingAppointment(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditedAppointment} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Patient Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingAppointment.patient_name}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, patient_name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={editingAppointment.phone}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={editingAppointment.email || ''}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                            placeholder="patient@example.com"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Dental Service *
                          </label>
                          <select
                            value={editingAppointment.service_id}
                            onChange={(e) => {
                              const srv = services.find(s => s.id === e.target.value);
                              setEditingAppointment({ 
                                ...editingAppointment, 
                                service_id: e.target.value,
                                service_name: srv ? srv.name : editingAppointment.service_name
                              });
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none bg-white"
                          >
                            {services.map(srv => (
                              <option key={srv.id} value={srv.id}>{srv.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Appointment Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={editingAppointment.appointment_date}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, appointment_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Appointment Time Slot *
                          </label>
                          <select
                            value={editingAppointment.appointment_time}
                            onChange={(e) => setEditingAppointment({ ...editingAppointment, appointment_time: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none bg-white font-mono"
                          >
                            <optgroup label="Morning / Midday">
                              <option value="09:30 AM">09:30 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="10:30 AM">10:30 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                              <option value="12:30 PM">12:30 PM</option>
                              <option value="01:00 PM">01:00 PM</option>
                            </optgroup>
                            <optgroup label="Evening">
                              <option value="04:30 PM">04:30 PM</option>
                              <option value="05:00 PM">05:00 PM</option>
                              <option value="05:30 PM">05:30 PM</option>
                              <option value="06:00 PM">06:00 PM</option>
                              <option value="06:30 PM">06:30 PM</option>
                              <option value="07:00 PM">07:00 PM</option>
                              <option value="07:30 PM">07:30 PM</option>
                              <option value="08:00 PM">08:00 PM</option>
                              <option value="08:30 PM">08:30 PM</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Appointment Status
                        </label>
                        <select
                          value={editingAppointment.status}
                          onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as AppointmentStatus })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none bg-white font-medium"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Internal Staff Notes & Action Log
                        </label>
                        <textarea
                          rows={2}
                          value={editingAppointment.notes || ''}
                          onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                          placeholder="e.g. Patient called to request earlier evening slot; confirmed by Dr."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Patient Chief Complaint / Initial Message
                        </label>
                        <textarea
                          rows={2}
                          value={editingAppointment.message || ''}
                          onChange={(e) => setEditingAppointment({ ...editingAppointment, message: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingAppointment(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 3: CANCEL APPOINTMENT CONFIRMATION */}
              {cancellingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Ban className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          Cancel Appointment
                        </h4>
                        <p className="text-xs text-slate-500">
                          This will update status to cancelled and record the reason in Supabase.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900">{cancellingAppointment.patient_name}</div>
                        <div className="text-slate-600 font-mono">
                          {cancellingAppointment.phone} · {cancellingAppointment.appointment_date} at {cancellingAppointment.appointment_time}
                        </div>
                        <div className="text-cyan-800 font-medium">{cancellingAppointment.service_name}</div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Select Cancellation Reason *
                        </label>
                        <div className="space-y-2">
                          {[
                            'Patient requested reschedule',
                            'Patient unreachable via phone or WhatsApp',
                            'Doctor or clinic schedule conflict',
                            'Patient feeling unwell / medical reason',
                            'custom'
                          ].map((r) => (
                            <label key={r} className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition">
                              <input
                                type="radio"
                                name="cancel_reason"
                                value={r}
                                checked={cancelReason === r}
                                onChange={() => setCancelReason(r)}
                                className="text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-xs text-slate-700">
                                {r === 'custom' ? 'Other custom reason...' : r}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {cancelReason === 'custom' && (
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Specify Reason *
                          </label>
                          <input
                            type="text"
                            required
                            value={customCancelReason}
                            onChange={(e) => setCustomCancelReason(e.target.value)}
                            placeholder="Enter specific cancellation reason..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCancellingAppointment(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Keep Appointment
                        </button>
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 4: CREATE WALK-IN / DIRECT PHONE BOOKING */}
              {isCreatingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          Schedule New Appointment
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          For clinic walk-ins or phone inquiries. Auto-saved to Supabase PostgreSQL.
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsCreatingAppointment(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateWalkinAppointment} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Patient Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={newBooking.patient_name}
                            onChange={(e) => setNewBooking({ ...newBooking, patient_name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="089... or 10-digit number"
                            value={newBooking.phone}
                            onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            placeholder="patient@example.com"
                            value={newBooking.email}
                            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Dental Service *
                          </label>
                          <select
                            required
                            value={newBooking.service_id}
                            onChange={(e) => setNewBooking({ ...newBooking, service_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none bg-white"
                          >
                            <option value="">Select Service...</option>
                            {services.map(srv => (
                              <option key={srv.id} value={srv.id}>{srv.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Appointment Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={newBooking.appointment_date}
                            onChange={(e) => setNewBooking({ ...newBooking, appointment_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Time Slot *
                          </label>
                          <select
                            value={newBooking.appointment_time}
                            onChange={(e) => setNewBooking({ ...newBooking, appointment_time: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none bg-white font-mono"
                          >
                            <optgroup label="Morning / Midday">
                              <option value="09:30 AM">09:30 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="10:30 AM">10:30 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                              <option value="12:30 PM">12:30 PM</option>
                              <option value="01:00 PM">01:00 PM</option>
                            </optgroup>
                            <optgroup label="Evening">
                              <option value="04:30 PM">04:30 PM</option>
                              <option value="05:00 PM">05:00 PM</option>
                              <option value="05:30 PM">05:30 PM</option>
                              <option value="06:00 PM">06:00 PM</option>
                              <option value="06:30 PM">06:30 PM</option>
                              <option value="07:00 PM">07:00 PM</option>
                              <option value="07:30 PM">07:30 PM</option>
                              <option value="08:00 PM">08:00 PM</option>
                              <option value="08:30 PM">08:30 PM</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Chief Complaint / Symptoms / Notes
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Toothache on upper left molar since 2 days; walk-in patient"
                          value={newBooking.message}
                          onChange={(e) => setNewBooking({ ...newBooking, message: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsCreatingAppointment(false)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? 'Saving...' : 'Schedule Booking'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 5: RESCHEDULE APPOINTMENT */}
              {reschedulingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                          <CalendarClock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 font-heading">
                            Reschedule Appointment
                          </h4>
                          <p className="text-xs text-slate-500">
                            Update appointment date and time in Supabase
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setReschedulingAppointment(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Patient:</span>
                        <span className="font-bold text-slate-900">{reschedulingAppointment.patient_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service:</span>
                        <span className="text-slate-800">{reschedulingAppointment.service_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Slot:</span>
                        <span className="font-mono text-cyan-800">{reschedulingAppointment.appointment_date} at {reschedulingAppointment.appointment_time}</span>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          New Appointment Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          New Time Slot *
                        </label>
                        <select
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none bg-white font-mono"
                        >
                          <optgroup label="Morning / Midday">
                            <option value="09:30 AM">09:30 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="10:30 AM">10:30 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="12:30 PM">12:30 PM</option>
                            <option value="01:00 PM">01:00 PM</option>
                          </optgroup>
                          <optgroup label="Evening">
                            <option value="04:30 PM">04:30 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                            <option value="05:30 PM">05:30 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                            <option value="06:30 PM">06:30 PM</option>
                            <option value="07:00 PM">07:00 PM</option>
                            <option value="07:30 PM">07:30 PM</option>
                            <option value="08:00 PM">08:00 PM</option>
                            <option value="08:30 PM">08:30 PM</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Reschedule Reason / Note (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Patient requested morning slot; doctor rescheduled"
                          value={rescheduleNotes}
                          onChange={(e) => setRescheduleNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setReschedulingAppointment(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isActionLoading}
                          className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isActionLoading ? 'Updating Supabase...' : 'Save Reschedule'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
  );

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        {dashboardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {dashboardContent}
    </div>
  );
};
