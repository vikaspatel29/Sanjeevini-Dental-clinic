import React from 'react';
import { Phone, MapPin, MessageSquare, Clock } from 'lucide-react';
import { ClinicConfig } from '../types';

interface AnnouncementBarProps {
  config: ClinicConfig;
  onOpenAdmin: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ config, onOpenAdmin }) => {
  return (
    <aside aria-label="Clinic Quick Information" className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
        {/* Left: Location & Landmark */}
        <div className="flex items-center gap-2 text-slate-300 truncate">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">
            <span className="font-medium text-white">Vinobanagar, Shivamogga</span>
            <span className="hidden sm:inline text-slate-400"> · Opposite Vikasa School, Near Police Chowki</span>
          </span>
        </div>

        {/* Right: Quick Verified Contact Links & Admin Portal Switch */}
        <div className="flex items-center gap-4 shrink-0 text-slate-300 text-xs">
          <a
            href={`tel:${config.phone}`}
            className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium tracking-wide">{config.displayPhone}</span>
          </a>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

          <a
            href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hello Sanjeevini Dental Clinic, I would like to inquire about dental services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Clinic</span>
          </a>

          <span className="text-slate-700 hidden md:inline" aria-hidden="true">|</span>

          <button
            onClick={onOpenAdmin}
            className="text-[11px] text-slate-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
            title="Clinic Owner & Staff Management Portal"
          >
            Staff Portal
          </button>
        </div>
      </div>
    </aside>
  );
};
