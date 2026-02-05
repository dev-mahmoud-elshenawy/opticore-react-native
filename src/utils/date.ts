import {
  format,
  parse,
  isValid,
  formatDistanceToNow,
  isToday as fnsIsToday,
  isYesterday as fnsIsYesterday,
  isSameDay as fnsIsSameDay,
} from 'date-fns';

/**
 * Formats a date object to a string.
 * Uses date-fns format tokens (e.g., 'yyyy-MM-dd').
 * @param date - Date object or timestamp
 * @param formatStr - Format string
 * @returns Formatted string or empty string if invalid
 */
export function formatDate(date: Date | number, formatStr: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (!isValid(d)) return '';
  return format(d, formatStr);
}

/**
 * Parses a date string into a Date object.
 * @param dateStr - Date string
 * @param formatStr - Format string matching the input
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string, formatStr: string): Date | null {
  if (!dateStr) return null;
  const d = parse(dateStr, formatStr, new Date());
  return isValid(d) ? d : null;
}

/**
 * Returns a relative time string (e.g., "3 days ago").
 * @param date - Date object or timestamp
 */
export function timeAgo(date: Date | number): string {
  if (!date) return '';
  const d = new Date(date);
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Checks if a date is today.
 * @param date - Date object or timestamp
 */
export function isToday(date: Date | number): boolean {
  if (!date) return false;
  return fnsIsToday(new Date(date));
}

/**
 * Checks if a date is yesterday.
 * @param date - Date object or timestamp
 */
export function isYesterday(date: Date | number): boolean {
  if (!date) return false;
  return fnsIsYesterday(new Date(date));
}

/**
 * Checks if two dates are on the same day.
 * @param date1 - First date
 * @param date2 - Second date
 */
export function isSameDay(date1: Date | number, date2: Date | number): boolean {
  if (!date1 || !date2) return false;
  return fnsIsSameDay(new Date(date1), new Date(date2));
}
