import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare } from 'lucide-react';
import { INITIAL_FAQS } from '../data/defaultData';
import { ClinicConfig } from '../types';

interface FaqSectionProps {
  config: ClinicConfig;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ config }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase">
            Helpful Information
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Clear answers about visiting Sanjeevini Dental Clinic in Vinobanagar, Shivamogga.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {INITIAL_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-700 bg-cyan-50' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra question helper box */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading">
              Have a specific question not covered here?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact our clinic reception directly during working hours.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${config.phone}`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Call Reception</span>
            </a>
            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hello Sanjeevini Dental Clinic, I have a question regarding dental treatment.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
