import React from 'react';
import { HeartHandshake, Clock, ShieldCheck, Stethoscope, MapPin } from 'lucide-react';
import { ClinicConfig } from '../types';

interface WhyChooseUsProps {
  config: ClinicConfig;
  onBookClick: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ config, onBookClick }) => {
  const trustPoints = [
    {
      title: 'Patient-Focused Care',
      description: 'We prioritize patient comfort and transparent communication, taking time to explain dental findings and discuss suitable treatment options.',
      icon: <HeartHandshake className="w-5 h-5 text-cyan-700" />,
    },
    {
      title: 'Convenient Appointment Scheduling',
      description: 'Structured time slots allow you to plan your visit without long waiting times. Online slot selection and direct phone booking available.',
      icon: <Clock className="w-5 h-5 text-cyan-700" />,
    },
    {
      title: 'Professional Dental Environment',
      description: 'A clean, hygienic operatory maintaining rigorous sterilization standards for instruments and treatment spaces.',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-700" />,
    },
    {
      title: 'Comprehensive Dental Services',
      description: 'From routine scaling and cavity restorations to root canal treatments, extractions, and dentures in one convenient practice.',
      icon: <Stethoscope className="w-5 h-5 text-cyan-700" />,
    },
    {
      title: 'Convenient Shivamogga Location',
      description: 'Centrally located in Vinobanagar near the Police Chowki and opposite Vikasa School, easily reached by local public and private transit.',
      icon: <MapPin className="w-5 h-5 text-cyan-700" />,
    },
  ];

  return (
    <section id="why-us" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase block">
            Clinical Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Why Patients Choose Sanjeevini Dental Clinic
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Our commitment is to provide dependable, ethical dental care in a comfortable environment for patients across Shivamogga.
          </p>
        </div>

        {/* Bento Grid: 2 Marquee cards + 3 Standard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 (Span 2 on lg for asymmetric hierarchy) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 mb-5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Patient-Focused Care & Clear Explanations
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed max-w-2xl">
                We believe that good dental health begins with trust. During your visit, every observation is explained clearly, and your personal comfort is prioritized at each stage of your treatment.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-cyan-300 font-medium">
                Ethical Consultation · No Unnecessary Procedures
              </span>
              <button
                onClick={onBookClick}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Book Your Checkup
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Hygienic Clinical Environment
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Meticulous sterilization protocols for handpieces and instruments ensure patient safety and infection prevention on every visit.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-cyan-800 mt-6 pt-4 border-t border-slate-200">
              Clean Treatment Operatory
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 mb-5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Punctual Appointment Slots
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Pre-allocated time intervals reduce waiting room congestion and provide adequate attention for thorough treatment.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-cyan-800 mt-6 pt-4 border-t border-slate-200">
              Online & Phone Booking
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 mb-5">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Comprehensive Dental Scope
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Providing preventive cleanings, fillings, root canal therapy, prosthetics, and extractions under one roof.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-cyan-800 mt-6 pt-4 border-t border-slate-200">
              Preventive & Restorative Care
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 mb-5">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Central Vinobanagar Location
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Easy to find landmark right opposite Vikasa School and near the Police Chowki in Vinobanagar, Shivamogga.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-cyan-800 mt-6 pt-4 border-t border-slate-200">
              Prominent Landmark
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
