import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { GalleryItem } from '../types';
import { resolveClinicImage } from '../services/clinicImages';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Treatment Room', 'Reception', 'Equipment', 'Clinic'];

  const filteredItems = selectedCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredItems.length - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex < filteredItems.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  return (
    <section id="gallery" className="py-16 md:py-24 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase block">
            Visual Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
            Clinic Environment & Facilities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Take a look inside Sanjeevini Dental Clinic. We maintain a calm, clean, and meticulously sanitized atmosphere for all dental procedures.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const resolvedUrl = resolveClinicImage(item.image_url);
            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-slate-900">
                  <img
                    src={resolvedUrl}
                    alt={item.alt_text}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/assets/images/')) {
                        target.src = resolveClinicImage(item.image_url, 'heroOperatory');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 shadow">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wide block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 font-heading mt-0.5 line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  {item.caption && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-5 right-5 p-3 text-white hover:text-cyan-300 hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-cyan-300 hover:bg-white/10 rounded-full transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-cyan-300 hover:bg-white/10 rounded-full transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black flex items-center justify-center">
                <img
                  src={resolveClinicImage(activeLightboxItem.image_url)}
                  alt={activeLightboxItem.alt_text}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                    {activeLightboxItem.category}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold font-heading mt-0.5">
                    {activeLightboxItem.title}
                  </h4>
                  {activeLightboxItem.caption && (
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      {activeLightboxItem.caption}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-400 tabular-nums shrink-0">
                  {lightboxIndex + 1} of {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
