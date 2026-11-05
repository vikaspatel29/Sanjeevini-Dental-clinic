import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ClinicConfig } from '../types';
import { Phone, MapPin, MessageSquare, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { createWhatsAppBookingUrl } from '../services/api';

interface FooterProps {
  config: ClinicConfig;
  onBookClick: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onBookClick, onOpenAdmin }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Overview (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="light" size="md" />
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mt-3">
              Professional dental care providing routine examinations, preventive cleanings, restorative procedures, and oral health consultations in Vinobanagar, Shivamogga, Karnataka.
            </p>

            <div className="pt-2 text-slate-300 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Vinobanagar, Shivamogga, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 text-cyan-400 text-center font-bold">·</span>
                <span className="text-slate-400">Landmark: Opposite Vikasa School, Near Police Chowki</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a href={`tel:${config.phone}`} className="text-white hover:text-cyan-300 font-semibold">
                  {config.displayPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-white transition">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">About Clinic</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition">Dental Services</a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition">Why Choose Us</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition">Clinic Gallery</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">FAQ</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">Find Us</a>
              </li>
            </ul>
          </div>

          {/* Dental Treatments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Treatments
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Dental Consultation</li>
              <li>Teeth Cleaning & Scaling</li>
              <li>Restorative Fillings</li>
              <li>Root Canal Treatment (RCT)</li>
              <li>Crowns & Dental Bridges</li>
              <li>Tooth Extraction</li>
              <li>Dentures & Prosthetics</li>
              <li>Children's Dental Care</li>
            </ul>
          </div>

          {/* Clinic Actions & Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Contact & Booking
            </h4>
            <div className="space-y-2.5">
              <button
                onClick={onBookClick}
                className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-semibold rounded-lg text-xs transition cursor-pointer text-center"
              >
                Book Appointment
              </button>

              <a
                href={createWhatsAppBookingUrl(config.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Clinic</span>
              </a>

              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Maps</span>
              </a>

              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
                >
                  Clinic Staff & Owner Portal
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Medical Disclaimer (Strictly mandatory per prompt Section 30) */}
        <div className="mt-12 pt-6 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed">
          <div className="flex items-start gap-2 max-w-4xl">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-400">Medical Disclaimer:</strong> Information on this website is provided for general informational purposes and does not replace professional dental consultation. We do not provide automated diagnoses or treatment recommendations through the website. Individual dental diagnosis requires direct clinical evaluation.
            </p>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Sanjeevini Dental Clinic, Vinobanagar, Shivamogga. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLegalModal('privacy')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setLegalModal('terms')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

      </div>

      {/* Legal Information Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
              {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>

            <div className="text-xs text-slate-600 space-y-3 max-h-80 overflow-y-auto pr-2 leading-relaxed">
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    <strong>Patient Privacy:</strong> Sanjeevini Dental Clinic respects the privacy of our patients. Personal details submitted during online appointment requests (such as your name, mobile phone number, and optional email) are used solely for scheduling and verifying clinic appointments.
                  </p>
                  <p>
                    <strong>No Third-Party Sharing:</strong> We do not sell, rent, or trade patient personal information to any third-party marketing entities.
                  </p>
                  <p>
                    <strong>Medical Confidentiality:</strong> All dental health discussions and records are treated with medical confidentiality in accordance with applicable healthcare standards.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Appointment Requests:</strong> Booking requests submitted through this website are provisional until verified by clinic staff via telephone or SMS/WhatsApp.
                  </p>
                  <p>
                    <strong>Clinical Evaluation:</strong> Fees and precise treatment plans are determined following direct clinical examination at our clinic in Vinobanagar, Shivamogga.
                  </p>
                  <p>
                    <strong>Cancellation & Rescheduling:</strong> If you are unable to attend your scheduled appointment, please notify the clinic at 089710 96312 in advance.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
