import React, { useState } from 'react';
import { Calendar, Phone, Navigation, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import { ClinicConfig } from '../types';
import { CLINIC_IMAGES, resolveClinicImage } from '../services/clinicImages';

interface HeroProps {
  config: ClinicConfig;
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ config, onBookClick }) => {
  const [imgSrc, setImgSrc] = useState<string>(CLINIC_IMAGES.heroOperatory);
  return (
    <section id="home" className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Subtle ambient medical glow, strictly within 60-30-10 palette */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Direct Actions */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Location & Verified Trust Kicker (Unboxed text with bullet separator, zero pills) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 tracking-wide">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span>Vinobanagar, Shivamogga</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-600">Opposite Vikasa School</span>
            </div>

            {/* Exact required headline with text-wrap: balance */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight font-heading max-w-2xl">
              Your Smile Deserves Expert Care.
            </h1>

            {/* Exact required supporting text */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Professional dental care focused on your comfort, oral health and confident smile.
            </p>

            {/* Action Buttons: Primary, Secondary, Additional */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onBookClick}
                className="px-6 py-3.5 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-cyan-200" />
                <span>Book an Appointment</span>
              </button>

              <a
                href={`tel:${config.phone}`}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4 text-cyan-300" />
                <span>Call the Clinic</span>
              </a>

              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-cyan-700" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Quiet Verified Trust Markers */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Patient-focused care</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hygienic operatory</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant slot request</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual & Small Trust Panel */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 group">
              <img
                src={imgSrc}
                alt="Sanjeevini Dental Clinic operatory room in Vinobanagar Shivamogga"
                className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                loading="eager"
                onError={() => {
                  if (imgSrc !== '/assets/images/hero_dental_operatory_1790247736308.jpg') {
                    setImgSrc('/assets/images/hero_dental_operatory_1790247736308.jpg');
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Exact required small trust panel */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/60 shadow-lg flex items-center justify-between z-10">
                <div>
                  <div className="text-xs font-bold text-slate-900 font-heading">
                    Sanjeevini Dental Clinic
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-600 shrink-0" />
                    <span>Shivamogga, Karnataka</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-cyan-800">
                    {config.displayPhone}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    Verified Listing
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
