import React, { useState } from 'react';
import { Calendar, Phone, MessageSquare, Navigation, Send, CheckCircle, MapPin } from 'lucide-react';
import { ClinicConfig } from '../types';
import { createWhatsAppBookingUrl } from '../services/api';

interface ContactCtaSectionProps {
  config: ClinicConfig;
  onBookClick: () => void;
}

export const ContactCtaSection: React.FC<ContactCtaSectionProps> = ({ config, onBookClick }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message })
      });
      setSent(true);
      setName('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: CTA Core */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase block">
              Schedule Your Visit
            </span>

            {/* Exact required heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
              Ready to Take Care of Your Smile?
            </h2>

            {/* Exact required text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Book your dental appointment with Sanjeevini Dental Clinic.
            </p>

            {/* Verified Clinic Address & Phone Display */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl max-w-lg space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-white font-heading text-base">
                Sanjeevini Dental Clinic
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Vinobanagar, Shivamogga, Karnataka</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300 font-semibold pt-1">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>089710 96312</span>
              </div>
            </div>

            {/* Exact required 4 action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBookClick}
                className="px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <a
                href={`tel:${config.phone}`}
                className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-cyan-700" />
                <span>Call Now</span>
              </a>

              <a
                href={createWhatsAppBookingUrl(config.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 border border-white/20 hover:border-white/40 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Get Directions</span>
              </a>
            </div>

          </div>

          {/* Right Column: Quick Inquiries Form */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
              <h3 className="text-lg font-bold text-white font-heading">
                Have a Quick Inquiry?
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-5">
                Send a message directly to our clinic staff.
              </p>

              {sent ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Message Received</strong>
                    <span>Our clinic team in Vinobanagar will review your inquiry and get in touch with you shortly.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cta-name" className="block text-xs font-medium text-slate-300 mb-1">
                      Your Name
                    </label>
                    <input
                      id="cta-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-phone" className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="cta-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 089710 96312"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-message" className="block text-xs font-medium text-slate-300 mb-1">
                      Message / Treatment Inquiry
                    </label>
                    <textarea
                      id="cta-message"
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Brief details regarding your visit..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
