import React from 'react';
import { Phone, MessageSquare, Calendar, Navigation } from 'lucide-react';
import { ClinicConfig } from '../types';
import { createWhatsAppBookingUrl } from '../services/api';

interface MobileBottomBarProps {
  config: ClinicConfig;
  onBookClick: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ config, onBookClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-4 gap-1.5 items-center max-w-md mx-auto">
        
        {/* 1. Call Button */}
        <a
          href={`tel:${config.phone}`}
          className="flex flex-col items-center justify-center py-1.5 px-1 text-slate-700 hover:text-cyan-700 transition"
          aria-label="Call Clinic"
        >
          <Phone className="w-4 h-4 text-cyan-700" />
          <span className="text-[10px] font-semibold mt-1">Call</span>
        </a>

        {/* 2. WhatsApp Button */}
        <a
          href={createWhatsAppBookingUrl(config.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-1 text-slate-700 hover:text-emerald-600 transition"
          aria-label="WhatsApp Clinic"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-semibold mt-1">WhatsApp</span>
        </a>

        {/* 3. Book Appointment (Visually prominent) */}
        <button
          onClick={onBookClick}
          className="flex flex-col items-center justify-center py-2 px-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl shadow-xs transition active:scale-95 col-span-1"
          aria-label="Book Dental Appointment"
        >
          <Calendar className="w-4 h-4 text-cyan-200" />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">Book Now</span>
        </button>

        {/* 4. Directions Button */}
        <a
          href={config.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-1 text-slate-700 hover:text-cyan-700 transition"
          aria-label="Get Directions in Google Maps"
        >
          <Navigation className="w-4 h-4 text-cyan-700" />
          <span className="text-[10px] font-semibold mt-1">Directions</span>
        </a>

      </div>
    </div>
  );
};
