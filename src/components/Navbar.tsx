import React, { useState } from 'react';
import { Menu, X, Calendar, Phone, MessageSquare, ChevronRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ClinicConfig } from '../types';

interface NavbarProps {
  config: ClinicConfig;
  onBookClick: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onBookClick, onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Why Choose Us', href: '#why-us' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Brand Wordmark (Single primary brand block) */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 rounded-lg group"
            aria-label="Sanjeevini Dental Clinic Home"
          >
            <BrandLogo size="md" />
          </a>

          {/* Zone 2: Navigation Links (Text with subtle hover state) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-cyan-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-600 hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${config.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-cyan-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-600" />
              <span>{config.displayPhone}</span>
            </a>

            <button
              onClick={onBookClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onBookClick}
              className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Book
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between px-3 py-2.5 text-base font-medium text-slate-800 hover:text-cyan-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Online</span>
            </button>

            <a
              href={`tel:${config.phone}`}
              className="w-full py-2.5 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Phone className="w-4 h-4 text-cyan-600" />
              <span>Call Clinic ({config.displayPhone})</span>
            </a>

            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hello Sanjeevini Dental Clinic, I would like to book an appointment.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Owner / Staff Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
