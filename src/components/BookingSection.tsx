import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  MessageSquare, 
  CalendarCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DentalService, ClinicConfig, Appointment } from '../types';
import { api, createWhatsAppBookingUrl, createGoogleCalendarUrl } from '../services/api';

interface BookingSectionProps {
  services: DentalService[];
  config: ClinicConfig;
  preSelectedService?: DentalService | null;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  services,
  config,
  preSelectedService,
  onBookingSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preSelectedService?.id || (services.length > 0 ? services[0].id : '')
  );

  // Default date to tomorrow or today if within hours
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Patient form fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Status & validation states
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Sync preSelectedService
  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
      if (step === 1) setStep(2);
    }
  }, [preSelectedService]);

  // Load existing appointments to compute slot availability
  useEffect(() => {
    api.getAppointments().then(res => setExistingAppointments(res));
  }, [step]);

  const activeServices = useMemo(() => {
    return services.filter(s => s.is_active);
  }, [services]);

  const selectedService = useMemo(() => {
    return activeServices.find(s => s.id === selectedServiceId) || activeServices[0];
  }, [activeServices, selectedServiceId]);

  // Generate date options for the next 30 days
  const dateOptions = useMemo(() => {
    const list: { dateStr: string; dayName: string; formatted: string; isClosed: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayConfig = config.bookingSettings.working_hours[dayName];
      const isClosed = dayConfig ? !dayConfig.isOpen : false;
      const isBlocked = config.bookingSettings.blocked_dates.includes(dateStr);

      list.push({
        dateStr,
        dayName,
        formatted: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isClosed: isClosed || isBlocked
      });
    }
    return list;
  }, [config]);

  // Generate available time slots based on selected date and clinic hours
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = config.bookingSettings.working_hours[dayName];

    if (!daySchedule || !daySchedule.isOpen) {
      return [];
    }

    const slots: { time: string; isBooked: boolean; session: 'morning' | 'evening' }[] = [];
    const maxPerSlot = config.bookingSettings.max_appointments_per_slot || 2;

    const generateTimeArray = (startH: number, startM: number, endH: number, endM: number, session: 'morning' | 'evening') => {
      let cur = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (cur < end) {
        const h = Math.floor(cur / 60);
        const m = cur % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m < 10 ? `0${m}` : `${m}`;
        const timeLabel = `${displayH}:${displayM} ${period}`;

        // Check booked count
        const count = existingAppointments.filter(
          a => a.appointment_date === selectedDate &&
               a.appointment_time === timeLabel &&
               a.status !== 'cancelled'
        ).length;

        slots.push({
          time: timeLabel,
          isBooked: count >= maxPerSlot,
          session
        });

        cur += config.bookingSettings.slot_duration_minutes || 30;
      }
    };

    // Morning Session: 09:30 to 13:30 (or breakStart)
    const [openH, openM] = (daySchedule.openTime || '09:30').split(':').map(Number);
    const [breakStartH, breakStartM] = daySchedule.hasBreak && daySchedule.breakStart 
      ? daySchedule.breakStart.split(':').map(Number) 
      : (daySchedule.closeTime || '13:30').split(':').map(Number);

    generateTimeArray(openH, openM, breakStartH, breakStartM, 'morning');

    // Evening Session: 16:30 to 20:30 (if break exists)
    if (daySchedule.hasBreak && daySchedule.breakEnd && daySchedule.closeTime) {
      const [breakEndH, breakEndM] = daySchedule.breakEnd.split(':').map(Number);
      const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
      generateTimeArray(breakEndH, breakEndM, closeH, closeM, 'evening');
    }

    return slots;
  }, [selectedDate, config, existingAppointments]);

  // Validation before proceeding to step 4
  const handleProceedToDetails = () => {
    if (!selectedTimeSlot) {
      setErrorMessage('Please select a time slot for your appointment.');
      return;
    }
    setErrorMessage('');
    setStep(4);
  };

  // Submit appointment request
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid mobile number (at least 10 digits).');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await api.createAppointment({
        patient_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        service_id: selectedService.id,
        service_name: selectedService.name,
        appointment_date: selectedDate,
        appointment_time: selectedTimeSlot,
        message: message.trim() || undefined
      });

      setConfirmedAppointment(created);
      setStep(5);
      if (onBookingSuccess) onBookingSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to book this slot. Please try another time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset booking form
  const handleReset = () => {
    setStep(1);
    setSelectedTimeSlot('');
    setFullName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setConfirmedAppointment(null);
    setErrorMessage('');
  };

  return (
    <section id="book-appointment" className="py-16 md:py-24 bg-white border-b border-slate-200/80 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase">
            Online Scheduling
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Book an Appointment
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Fast, guest-friendly dental appointment request in less than 2 minutes. No account needed.
          </p>
        </div>

        {/* Step Progression Bar (Clean, unboxed indicators) */}
        {step < 5 && (
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-cyan-800 font-bold' : ''}>1. Service</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={step >= 2 ? 'text-cyan-800 font-bold' : ''}>2. Date</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={step >= 3 ? 'text-cyan-800 font-bold' : ''}>3. Time</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={step >= 4 ? 'text-cyan-800 font-bold' : ''}>4. Details</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-700 h-full transition-all duration-300 ease-out" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Flow Container */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm">
          
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Step 1: Select Dental Service
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the type of dental consultation or treatment you need.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {activeServices.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-cyan-900 text-white border-cyan-800 shadow-sm' 
                          : 'bg-white text-slate-800 border-slate-200 hover:border-cyan-600/50 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold font-heading line-clamp-1">
                          {srv.name}
                        </div>
                        <p className={`text-xs mt-1.5 line-clamp-2 ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                          {srv.description}
                        </p>
                      </div>

                      <div className={`mt-3 pt-2 text-[11px] font-medium flex items-center justify-between border-t ${
                        isSelected ? 'border-cyan-800 text-cyan-200' : 'border-slate-100 text-slate-400'
                      }`}>
                        <span>~{srv.duration_minutes} mins</span>
                        <span>{srv.price || 'Consultation'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <span>Select Preferred Date</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Step 2: Choose Appointment Date
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selected Service: <span className="font-semibold text-slate-800">{selectedService?.name}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  Change Service
                </button>
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {dateOptions.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  const isClosed = item.isClosed;

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      disabled={isClosed}
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedTimeSlot(''); // reset slot when date changes
                      }}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isClosed
                          ? 'bg-slate-100/60 text-slate-300 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-cyan-900 text-white border-cyan-800 shadow-sm cursor-pointer'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-600/50 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isSelected ? 'text-cyan-200' : isClosed ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {item.dayName.slice(0, 3)}
                      </span>
                      <span className="text-sm font-bold font-heading mt-0.5">
                        {item.formatted.split(',')[1] || item.formatted}
                      </span>
                      <span className="text-[10px] mt-1">
                        {isClosed ? 'Closed' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <span>View Available Slots</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time Slot */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Step 3: Choose Time Slot
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <span className="font-semibold text-slate-800">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  Change Date
                </button>
              </div>

              {timeSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
                  The clinic is not open for standard online bookings on this day. Please select another date or contact the clinic directly at 089710 96312.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Morning Slots */}
                  {timeSlots.some(s => s.session === 'morning') && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Morning Session</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {timeSlots.filter(s => s.session === 'morning').map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`p-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : selectedTimeSlot === slot.time
                                ? 'bg-cyan-900 text-white border-cyan-800 shadow-sm cursor-pointer'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-cyan-600/50 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <span>{slot.time}</span>
                            <span className="text-[10px] font-normal mt-0.5 opacity-80">
                              {slot.isBooked ? 'Slot Full' : 'Available'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {timeSlots.some(s => s.session === 'evening') && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Evening Session</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {timeSlots.filter(s => s.session === 'evening').map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`p-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : selectedTimeSlot === slot.time
                                ? 'bg-cyan-900 text-white border-cyan-800 shadow-sm cursor-pointer'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-cyan-600/50 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <span>{slot.time}</span>
                            <span className="text-[10px] font-normal mt-0.5 opacity-80">
                              {slot.isBooked ? 'Slot Full' : 'Available'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Dates</span>
                </button>
                <button
                  type="button"
                  onClick={handleProceedToDetails}
                  disabled={!selectedTimeSlot}
                  className={`px-6 py-3 text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition-all ${
                    selectedTimeSlot
                      ? 'bg-cyan-700 hover:bg-cyan-800 text-white cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Enter Patient Information</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Enter Patient Information */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Step 4: Patient Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedService?.name} · {selectedDate} at {selectedTimeSlot}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  Change Slot
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="patient-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="patient-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="patient-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="patient-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    We will call or SMS you to confirm your appointment.
                  </span>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label htmlFor="patient-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="patient-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Reason for Visit / Message */}
                <div>
                  <label htmlFor="patient-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Visit / Symptoms <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="patient-message"
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Toothache, routine scaling, cavity check"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-slate-800">{selectedDate} · {selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">Vinobanagar, Shivamogga (Near Police Chowki)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Confirm & Submit Request</span>
                      <CheckCircle className="w-4 h-4 text-cyan-200" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Confirmation Screen (Exact required specification) */}
          {step === 5 && confirmedAppointment && (
            <div className="text-center py-4 space-y-6 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>

              {/* Required Header Text */}
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Appointment Request Received
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                  Thank you! Our clinic team has received your appointment request and will confirm your slot shortly.
                </p>
              </div>

              {/* Exact required details display */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 text-left text-xs sm:text-sm space-y-2.5 shadow-sm">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900">{confirmedAppointment.patient_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.service_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.appointment_date}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Time:</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.appointment_time}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Clinic:</span>
                  <span className="font-semibold text-slate-800">Sanjeevini Dental Clinic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-bold text-cyan-800">{config.displayPhone}</span>
                </div>
              </div>

              {/* Exact required 4 action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={createGoogleCalendarUrl(confirmedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <CalendarCheck className="w-4 h-4 text-cyan-700" />
                  <span>Add to Calendar</span>
                </a>

                <a
                  href={`tel:${config.phone}`}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Phone className="w-4 h-4 text-cyan-300" />
                  <span>Call Clinic</span>
                </a>

                <a
                  href={createWhatsAppBookingUrl(config.whatsapp, {
                    name: confirmedAppointment.patient_name,
                    service: confirmedAppointment.service_name,
                    date: confirmedAppointment.appointment_date,
                    time: confirmedAppointment.appointment_time
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Clinic</span>
                </a>

                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <MapPin className="w-4 h-4 text-cyan-700" />
                  <span>Get Directions</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Book another appointment
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
