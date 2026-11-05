import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Check } from 'lucide-react';
import { ClinicConfig } from '../types';

interface TrustLocationStripProps {
  config: ClinicConfig;
}

export const TrustLocationStrip: React.FC<TrustLocationStripProps> = ({ config }) => {
  return (
    <section className="bg-slate-900 text-white py-6 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Item 1: Exact Location & Landmark */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-800 text-cyan-400 rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Vinobanagar, Shivamogga
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Near Police Chowki / opposite Vikasa School
              </p>
            </div>
          </div>

          {/* Item 2: Verified Direct Contact */}
          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="p-2.5 bg-slate-800 text-cyan-400 rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Direct Appointment Booking
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Call <a href={`tel:${config.phone}`} className="text-cyan-300 hover:underline font-medium">{config.displayPhone}</a> or book online
              </p>
            </div>
          </div>

          {/* Item 3: Clinical Standard */}
          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="p-2.5 bg-slate-800 text-cyan-400 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Sterilization & Patient Comfort
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Clean treatment operatory with focused dental care
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
