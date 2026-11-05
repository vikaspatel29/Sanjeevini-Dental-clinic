import React from 'react';
import { MapPin, Navigation, Phone, ExternalLink, Compass } from 'lucide-react';
import { ClinicConfig } from '../types';
import { OpeningHoursCard } from './OpeningHoursCard';

interface LocationMapSectionProps {
  config: ClinicConfig;
}

export const LocationMapSection: React.FC<LocationMapSectionProps> = ({ config }) => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase block">
            Clinic Location
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Find Sanjeevini Dental Clinic
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Easily accessible location in Vinobanagar, Shivamogga. Follow landmarks near the Police Chowki and opposite Vikasa School.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Location Details & Directions Preview Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Address Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-cyan-700 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Sanjeevini Dental Clinic
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
                    Vinobanagar, Shivamogga, Karnataka, India
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Known landmark: Opposite Vikasa School / Near Police Chowki
                  </p>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Get Directions in Google Maps</span>
                </a>

                <a
                  href={`tel:${config.phone}`}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Call {config.displayPhone}</span>
                </a>
              </div>
            </div>

            {/* Directional Guide Landmarks */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-700" />
                <span>Nearby Landmarks & Transit</span>
              </h4>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-700 font-bold shrink-0">·</span>
                  <span><strong>Opposite Vikasa School:</strong> Prime recognizable local landmark situated across from the campus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-700 font-bold shrink-0">·</span>
                  <span><strong>Near Police Chowki:</strong> Prominent public safety landmark in Vinobanagar junction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-700 font-bold shrink-0">·</span>
                  <span><strong>Auto & Vehicle Access:</strong> Frequent auto-rickshaw availability from Shivamogga bus station and railway terminal.</span>
                </li>
              </ul>
            </div>

            {/* Google Maps Embed / Interactive Direction View */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm relative h-64 bg-slate-100">
              <iframe
                title="Sanjeevini Dental Clinic Google Maps Location"
                src={`https://maps.google.com/maps?q=Sanjeevini+Dental+Clinic+Vinobanagar+Shivamogga&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-semibold rounded-lg shadow border border-slate-200 flex items-center gap-1.5 hover:bg-white"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-700" />
                  <span>Open Full Screen Map</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Opening Hours Component */}
          <div className="lg:col-span-6">
            <OpeningHoursCard config={config} />
          </div>

        </div>

      </div>
    </section>
  );
};
