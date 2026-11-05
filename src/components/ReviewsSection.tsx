import React from 'react';
import { Star, ExternalLink, CheckCircle2, Quote } from 'lucide-react';
import { ReviewItem, ClinicConfig } from '../types';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  config: ClinicConfig;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, config }) => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-cyan-800 tracking-wider uppercase block">
              Patient Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mt-2">
              Patient Reviews
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Feedback from patients who visited Sanjeevini Dental Clinic in Vinobanagar, Shivamogga.
            </p>
          </div>

          {/* Exact required "View Google Reviews" button */}
          <div className="shrink-0">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-xs"
            >
              <span>View Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xs transition"
            >
              <div>
                {/* Rating stars & verified tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1" aria-label={`Rating: ${rev.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.is_verified_google_review && (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700" />
                      <span>Google Review</span>
                    </span>
                  )}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Patient signature & date */}
              <div className="pt-4 mt-6 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 font-heading">
                  {rev.patient_name}
                </span>
                <span className="text-slate-400 tabular-nums">
                  {rev.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle note about authentic reviews */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Have you visited our clinic recently? Share your feedback on Google to help other patients in Shivamogga.
        </div>

      </div>
    </section>
  );
};
