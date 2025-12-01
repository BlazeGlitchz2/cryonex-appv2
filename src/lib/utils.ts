import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSamsungPerformanceDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // Target Samsung Tablets (SM-T series) and specifically "G Tab S50" if present in UA
  // Also covering common Samsung Tablet identifiers
  return /Samsung/i.test(ua) && (/Tablet|SM-T|G Tab S50|SM-T720|SM-T725/i.test(ua));
}