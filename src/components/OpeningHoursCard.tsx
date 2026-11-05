import React, { useMemo } from 'react';
import { Clock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { ClinicConfig, DayWorkingHours } from '../types';

interface OpeningHoursCardProps {
  config: ClinicConfig;
}

export const OpeningHoursCard: React.FC<OpeningHoursCardProps> = ({ config }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate live OPEN NOW or CLOSED NOW status
  const currentStatus = useMemo(() => {
    if (!config.workingHoursConfigured) {
      return { status: 'unverified', text: 'Hours Subject to Confirmation', color: 'text-slate-500' };
    }

    const now = new Date();
    const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = config.bookingSettings.working_hours[todayName];

    if (!todayHours || !todayHours.isOpen) {
      return { status: 'closed', text: 'CLOSED TODAY', color: 'text-rose-600', badgeBg: 'bg-rose-50 border-rose-200' };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const openMin = parseTimeToMinutes(todayHours.openTime || '09:30');
    const closeMin = parseTimeToMinutes(todayHours.closeTime || '20:30');

    if (todayHours.hasBreak && todayHours.breakStart && todayHours.breakEnd) {
      const breakStartMin = parseTimeToMinutes(todayHours.breakStart);
      const breakEndMin = parseTimeToMinutes(todayHours.breakEnd);

      if (currentMinutes >= openMin && currentMinutes < breakStartMin) {
        return { status: 'open', text: 'OPEN NOW (Morning Session)', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' };
      }
      if (currentMinutes >= breakStartMin && currentMinutes < breakEndMin) {
        return { status: 'break', text: 'ON AFTERNOON BREAK', color: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200' };
      }
      if (currentMinutes >= breakEndMin && currentMinutes < closeMin) {
        return { status: 'open', text: 'OPEN NOW (Evening Session)', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' };
      }
    } else {
      if (currentMinutes >= openMin && currentMinutes < closeMin) {
        return { status: 'open', text: 'OPEN NOW', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' };
      }
    }

    return { status: 'closed', text: 'CLOSED NOW', color: 'text-slate-600', badgeBg: 'bg-slate-100 border-slate-200' };
  }, [config]);

  const formatTimeDisplay = (time24: string) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  };

  const todayIndex = new Date().getDay();
  // In JS getDay(): 0 is Sunday, 1 is Monday ...
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Clinic Working Hours
            </h3>
            <p className="text-[11px] text-slate-500">
              Sanjeevini Dental Clinic Schedule
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide ${currentStatus.badgeBg || 'bg-slate-100 border-slate-200'} ${currentStatus.color}`}>
          {currentStatus.text}
        </div>
      </div>

      {/* Weekday Schedule list */}
      <div className="mt-4 space-y-2 text-xs sm:text-sm">
        {daysOfWeek.map((day) => {
          const schedule: DayWorkingHours = config.bookingSettings.working_hours[day] || {
            day,
            isOpen: false,
            openTime: '',
            closeTime: '',
            hasBreak: false,
            isVerified: false
          };

          const isToday = day === currentDayName;

          return (
            <div
              key={day}
              className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors ${
                isToday ? 'bg-cyan-50/70 font-semibold text-cyan-950 border border-cyan-100' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-24 sm:w-28 font-medium">{day}</span>
                {isToday && (
                  <span className="text-[10px] text-cyan-800 font-bold bg-cyan-100/70 px-1.5 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>

              <div className="text-right">
                {schedule.isOpen ? (
                  schedule.hasBreak ? (
                    <span className="font-mono text-xs">
                      {formatTimeDisplay(schedule.openTime)} - {formatTimeDisplay(schedule.breakStart || '')}
                      <span className="text-slate-400 mx-1">|</span>
                      {formatTimeDisplay(schedule.breakEnd || '')} - {formatTimeDisplay(schedule.closeTime)}
                    </span>
                  ) : (
                    <span className="font-mono text-xs">
                      {formatTimeDisplay(schedule.openTime)} - {formatTimeDisplay(schedule.closeTime)}
                    </span>
                  )
                ) : (
                  <span className="text-slate-400 font-medium italic">Closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency & Note footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
        <AlertCircle className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <p>
          Timings may adjust on public holidays. For dental pain or emergency consultations, please call{' '}
          <a href={`tel:${config.phone}`} className="font-semibold text-cyan-800 hover:underline">
            {config.displayPhone}
          </a>{' '}
          to verify immediate chair availability.
        </p>
      </div>
    </div>
  );
};
