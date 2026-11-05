import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Scissors, 
  Crown, 
  Smile, 
  Layers, 
  Sun, 
  Heart, 
  CheckCircle2, 
  Cpu, 
  Clock, 
  ArrowRight,
  Info,
  X,
  Calendar
} from 'lucide-react';
import { DentalService } from '../types';

interface ServicesSectionProps {
  services: DentalService[];
  onSelectServiceToBook: (service: DentalService) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope className="w-5 h-5 text-cyan-700" />,
  Sparkles: <Sparkles className="w-5 h-5 text-cyan-700" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-cyan-700" />,
  Activity: <Activity className="w-5 h-5 text-cyan-700" />,
  Scissors: <Scissors className="w-5 h-5 text-cyan-700" />,
  Crown: <Crown className="w-5 h-5 text-cyan-700" />,
  Smile: <Smile className="w-5 h-5 text-cyan-700" />,
  Layers: <Layers className="w-5 h-5 text-cyan-700" />,
  Sun: <Sun className="w-5 h-5 text-cyan-700" />,
  Heart: <Heart className="w-5 h-5 text-cyan-700" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5 text-cyan-700" />,
  Cpu: <Cpu className="w-5 h-5 text-cyan-700" />,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceToBook
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalService, setActiveModalService] = useState<DentalService | null>(null);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'preventive', label: 'Preventive Care' },
    { id: 'restorative', label: 'Restorative & RCT' },
    { id: 'surgical', label: 'Extraction & Implants' },
    { id: 'cosmetic', label: 'Cosmetic & Whitening' },
    { id: 'pediatric', label: 'Pediatric Care' },
  ];

  const activeServices = services.filter(s => s.is_active);
  const filteredServices = selectedCategory === 'all' 
    ? activeServices 
    : activeServices.filter(s => s.category === selectedCategory || (selectedCategory === 'surgical' && (s.category === 'surgical' || s.id === 'implants')));

  return (
    <section id="services" className="py-16 md:py-24 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase block">
            Clinical Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Comprehensive Dental Care in Shivamogga
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            From essential routine check-ups and thorough cleaning to restorative and orthodontic consultations, discover the treatments provided at Sanjeevini Dental Clinic.
          </p>
        </div>

        {/* Category Filters (Interactive buttons allowed per constitution) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid (Single-elevation, 14-20px radius cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const icon = iconMap[service.icon_name] || <Stethoscope className="w-5 h-5 text-cyan-700" />;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-cyan-600/40 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Header: Icon & Duration metadata */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100">
                      {icon}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.duration_minutes} mins</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-cyan-800 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                {/* Card Footer: Pricing info & Action Buttons */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Pricing</span>
                    <span className="font-semibold text-slate-700">
                      {service.price || 'Consultation required'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveModalService(service)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3 h-3 text-slate-500" />
                      <span>Learn More</span>
                    </button>

                    <button
                      onClick={() => onSelectServiceToBook(service)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3 text-cyan-200" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Details Modal */}
        {activeModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setActiveModalService(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100">
                  {iconMap[activeModalService.icon_name] || <Stethoscope className="w-5 h-5 text-cyan-700" />}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wider block">
                    Service Overview
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    {activeModalService.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 mt-4">
                <p className="leading-relaxed">
                  {activeModalService.description}
                </p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Duration:</span>
                    <span className="font-semibold text-slate-800">{activeModalService.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pricing Policy:</span>
                    <span className="font-semibold text-slate-800">{activeModalService.price || 'Discussed after clinical examination'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold text-slate-800">Sanjeevini Dental Clinic, Vinobanagar</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  * Clinical treatments are carried out following a complete personal consultation to ensure optimal comfort and dental hygiene.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalService(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const srv = activeModalService;
                    setActiveModalService(null);
                    onSelectServiceToBook(srv);
                  }}
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Proceed to Book Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
