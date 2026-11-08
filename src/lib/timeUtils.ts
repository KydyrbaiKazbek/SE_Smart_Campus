export const MINUTES_PER_DAY = 1440;

export type TimeFormat = "24h" | "12h";

/** Convert minutes-from-midnight to "HH:MM" (24-hour). */
export function minutesToHHMM(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Parse an "HH:MM" string into minutes from midnight. Returns null if invalid. */
export function hhmmToMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Get the current time in minutes from midnight. */
export function nowInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Convert minutes-from-midnight to 12-hour format string "h:mm AM/PM". */
export function minutesTo12h(minutes: number): string {
  const m = Math.round(minutes);
  let h = Math.floor(m / 60);
  const mm = m % 60;
  const period = h < 12 ? "AM" : "PM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(mm).padStart(2, "0")} ${period}`;
}

/** Parse a 12-hour time string "h:mm AM/PM" into minutes from midnight. Returns null if invalid. */
export function parse12h(input: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(input.trim());
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (period === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return h * 60 + m;
}

/** Formats minutes from midnight into the specified time format (24h or 12h). */
export function formatMinutes(minutes: number, format: TimeFormat = "24h"): string {
  return format === "12h" ? minutesTo12h(minutes) : minutesToHHMM(minutes);
}
