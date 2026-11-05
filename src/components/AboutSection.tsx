import React, { useState } from 'react';
import { MapPin, CheckCircle2, Phone, Calendar, ArrowRight } from 'lucide-react';
import { ClinicConfig } from '../types';
import { CLINIC_IMAGES } from '../services/clinicImages';

interface AboutSectionProps {
  config: ClinicConfig;
  onBookClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ config, onBookClick }) => {
  const [receptionSrc, setReceptionSrc] = useState<string>(CLINIC_IMAGES.clinicReception);
  const [consultationSrc, setConsultationSrc] = useState<string>(CLINIC_IMAGES.consultationRoom);

  return (
    <section id="about" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Showcase (2 high-fidelity authentic images) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
                  <img
                    src={receptionSrc}
                    alt="Sanjeevini Dental Clinic reception and patient lounge in Shivamogga"
                    className="w-full h-52 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={() => {
                      if (receptionSrc !== '/assets/images/clinic_reception_interior_1790247750608.jpg') {
                        setReceptionSrc('/assets/images/clinic_reception_interior_1790247750608.jpg');
                      }
                    }}
                  />
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wider block">
                    Verified Location
                  </span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Vinobanagar, Shivamogga
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Near Police Chowki / opp. Vikasa School
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
                  <img
                    src={consultationSrc}
                    alt="Dental consultation room with clinical models at Sanjeevini Dental Clinic"
                    className="w-full h-60 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={() => {
                      if (consultationSrc !== '/assets/images/dental_consultation_room_1790247786240.jpg') {
                        setConsultationSrc('/assets/images/dental_consultation_room_1790247786240.jpg');
                      }
                    }}
                  />
                </div>
                <div className="p-4 bg-cyan-900 text-white rounded-2xl shadow-sm">
                  <span className="text-xs font-medium text-cyan-200 block">Direct Inquiries</span>
                  <a
                    href={`tel:${config.phone}`}
                    className="text-sm font-bold tracking-tight text-white hover:text-cyan-200 mt-0.5 block"
                  >
                    {config.displayPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Factual Narrative Column */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col space-y-6">
            
            <div className="text-xs font-semibold text-cyan-700 tracking-wider uppercase">
              About the Practice
            </div>

            {/* Exact required heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Comfortable Care. Healthier Smiles.
            </h2>

            {/* Exact required factual description without unverified claims */}
            <p className="text-base text-slate-700 leading-relaxed">
              Sanjeevini Dental Clinic provides dental care in Vinobanagar, Shivamogga, with a focus on patient care, oral health and comfortable treatment.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you are visiting for a routine oral examination, preventive cleaning, or seeking consultation for dental restorations and treatments, our priority is providing clear explanations and gentle care tailored to your individual dental needs.
            </p>

            {/* Factual Practice Points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <strong className="text-slate-900 font-semibold">Convenient Vinobanagar Location:</strong> Situated right near the Police Chowki and opposite Vikasa School, easily accessible from all parts of Shivamogga.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <strong className="text-slate-900 font-semibold">Patient-Centered Consultation:</strong> Each treatment option, procedure duration, and preventive recommendation is discussed clearly before proceeding.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <strong className="text-slate-900 font-semibold">Scheduled Appointments:</strong> Structured time slots ensure dedicated attention and reduce waiting times for patients.
                </div>
              </div>
            </div>

            {/* CTA row */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onBookClick}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Schedule a Consultation</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 underline underline-offset-4"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Google Maps</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
