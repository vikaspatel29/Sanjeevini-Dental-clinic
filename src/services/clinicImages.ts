// Centralized image asset manager for Sanjeevini Dental Clinic
// Provides bundled asset URLs, direct static URLs, and high-fidelity SVG/gradient fallbacks.

import heroOperatoryUrl from '../assets/images/hero_dental_operatory_1790247736308.jpg';
import clinicReceptionUrl from '../assets/images/clinic_reception_interior_1790247750608.jpg';
import dentalInstrumentsUrl from '../assets/images/dental_instruments_clean_1790247768633.jpg';
import consultationRoomUrl from '../assets/images/dental_consultation_room_1790247786240.jpg';

export const CLINIC_IMAGES = {
  heroOperatory: heroOperatoryUrl,
  clinicReception: clinicReceptionUrl,
  dentalInstruments: dentalInstrumentsUrl,
  consultationRoom: consultationRoomUrl,
} as const;

/**
 * Normalizes any image URL passed from API, state, or legacy configs.
 * Resolves legacy `/src/assets/images/...` paths to modern bundled assets or public paths.
 */
export function resolveClinicImage(pathOrUrl: string | undefined | null, fallbackKey: keyof typeof CLINIC_IMAGES = 'heroOperatory'): string {
  if (!pathOrUrl) {
    return CLINIC_IMAGES[fallbackKey];
  }

  // Map known file basenames
  if (pathOrUrl.includes('hero_dental_operatory')) {
    return CLINIC_IMAGES.heroOperatory;
  }
  if (pathOrUrl.includes('clinic_reception_interior')) {
    return CLINIC_IMAGES.clinicReception;
  }
  if (pathOrUrl.includes('dental_instruments_clean')) {
    return CLINIC_IMAGES.dentalInstruments;
  }
  if (pathOrUrl.includes('dental_consultation_room')) {
    return CLINIC_IMAGES.consultationRoom;
  }

  // If path starts with /src/assets/images, convert to /assets/images
  if (pathOrUrl.startsWith('/src/assets/images/')) {
    return pathOrUrl.replace('/src/assets/images/', '/assets/images/');
  }

  return pathOrUrl;
}
