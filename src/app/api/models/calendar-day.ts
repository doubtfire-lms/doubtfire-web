/**
 * Teaching week arithmetic subtracts two dates and divides by a week, so the two
 * dates have to be a whole number of days apart. Local midnights are not: across a
 * daylight saving change two of them are 23 or 25 hours apart, which is enough for
 * `Math.floor(difference / week)` to lose a week and slide every week boundary onto
 * the wrong day. Pinning each calendar day to midnight UTC keeps the gaps exact.
 *
 * The calendar day itself is still read locally, so a date reads as the day the user
 * sees it, not the day it falls on in UTC.
 */
export function startOfDay(date: Date | string | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }

  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

/**
 * Add whole days to a day produced by {@link startOfDay}.
 */
export function addDays(day: Date, days: number): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + days));
}

export const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
