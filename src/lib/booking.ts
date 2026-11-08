import type { Booking } from "@/types";
import { minutesToHHMM, MINUTES_PER_DAY } from "@/lib/timeUtils";

const MAX_BOOKING_LENGTH = 120;

export type BookingCheckInput = {
  start: number;
  end: number;
  now: number;
  blocked?: boolean;
  blockReason?: string;
  bookings: Array<Pick<Booking, "start" | "end" | "purpose" | "bookedBy"> & { id?: string }>;
};

/**
 * AC1: 0 ≤ start < end ≤ 1440 and start must be after the supplied current time.
 * AC2: Reject bookings longer than 120 minutes.
 * AC3: Reject when the selected room is blocked.
 * AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
 */
export function getBookingIssues(input: BookingCheckInput): string[] {
  const { start, end, now, blocked, blockReason, bookings } = input;
  const issues: string[] = [];

  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    issues.push("The start time must be earlier than the end time, and both must be within 00:00–24:00.");
  } else if (start <= now) {
    issues.push("The start time must be after the current time.");
  }

  if (end - start > MAX_BOOKING_LENGTH) {
    issues.push(`Bookings cannot be longer than ${MAX_BOOKING_LENGTH} minutes (2 hours).`);
  }

  if (blocked) {
    issues.push(blockReason ?? "This room is currently blocked and cannot be booked.");
  }

  for (const b of bookings) {
    if (start < b.end && end > b.start) {
      issues.push(
        `Overlaps with "${b.purpose}" (${minutesToHHMM(b.start)}–${minutesToHHMM(b.end)}, booked by ${b.bookedBy}).`,
      );
    }
  }

  return issues;
}

export function canBook(input: BookingCheckInput): boolean {
  return getBookingIssues(input).length === 0;
}
