import { describe, it, expect, beforeEach } from 'vitest';
import { canBook, getBookingIssues, checkAvailability } from './booking';

describe('Booking Validation', () => {
  let defaultNow: number;
  let defaultBlocked: boolean;
  let defaultBookings: { start: number; end: number; purpose: string; bookedBy: string }[];

  beforeEach(() => {
    defaultNow = 540;
    defaultBlocked = false;
    defaultBookings = [{ start: 600, end: 660, purpose: 'Sync', bookedBy: 'Alice' }];
  });

  it('T01: Accept a candidate interval touching after an existing booking', () => {
    expect(canBook({ start: 660, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings })).toBe(true);
  });

  it('T02: Reject candidate interval that starts exactly at current time (now)', () => {
    const input = { start: 540, end: 570, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("The start time must be after the current time.");
  });

  it('T03: Reject candidate interval with zero duration', () => {
    const input = { start: 720, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("The start time must be earlier than the end time, and both must be within 00:00–24:00.");
  });

  it('T04: Reject candidate interval with reversed start and end', () => {
    const input = { start: 750, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("The start time must be earlier than the end time, and both must be within 00:00–24:00.");
  });

  it('T05: Reject candidate interval extending past end of day', () => {
    const input = { start: 1380, end: 1441, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("The start time must be earlier than the end time, and both must be within 00:00–24:00.");
  });

  it('T06: Accept candidate interval exactly 120 minutes long', () => {
    expect(canBook({ start: 720, end: 840, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings })).toBe(true);
  });

  it('T07: Reject candidate interval longer than 120 minutes', () => {
    const input = { start: 720, end: 841, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Bookings cannot be longer than 120 minutes (2 hours).");
  });

  it('T08: Accept candidate interval touching before an existing booking', () => {
    expect(canBook({ start: 570, end: 600, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings })).toBe(true);
  });

  it('T09: Reject candidate interval with partial overlap', () => {
    const input = { start: 630, end: 690, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Overlaps with \"Sync\" (10:00–11:00, booked by Alice).");
  });

  it('T10: Reject candidate interval that completely contains an existing booking', () => {
    const input = { start: 570, end: 690, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Overlaps with \"Sync\" (10:00–11:00, booked by Alice).");
  });

  it('T11: Reject candidate interval completely inside an existing booking', () => {
    const input = { start: 615, end: 645, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Overlaps with \"Sync\" (10:00–11:00, booked by Alice).");
  });

  it('T12: Reject candidate interval identical to an existing booking', () => {
    const input = { start: 600, end: 660, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Overlaps with \"Sync\" (10:00–11:00, booked by Alice).");
  });

  it('T13: Reject candidate interval when room is blocked (default message)', () => {
    const input = { start: 660, end: 720, now: defaultNow, blocked: true, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("This room is currently blocked and cannot be booked.");
  });

  it('T14: Accept candidate interval when bookings array is empty', () => {
    expect(canBook({ start: 630, end: 690, now: defaultNow, blocked: defaultBlocked, bookings: [] })).toBe(true);
  });

  it('T15: Accept interval and ensure existing booking data is preserved', () => {
    const originalBookings = JSON.parse(JSON.stringify(defaultBookings));
    const result = canBook({ start: 660, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings });
    
    expect(result).toBe(true);
    expect(defaultBookings).toEqual(originalBookings);
  });

  it('T16: Accept interval with 1 minute duration (minimum possible)', () => {
    expect(canBook({ start: 720, end: 721, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings })).toBe(true);
  });

  it('T17: Accept valid interval between multiple existing bookings', () => {
    const multipleBookings = [
      { start: 600, end: 660, purpose: 'Sync', bookedBy: 'Alice' },
      { start: 750, end: 800, purpose: 'Interview', bookedBy: 'Bob' }
    ];
    expect(canBook({ start: 690, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: multipleBookings })).toBe(true);
  });

  it('T18: Accept candidate ending exactly at end of day 1440 (AC1 Boundary)', () => {
    expect(canBook({ start: 1320, end: 1440, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings })).toBe(true);
  });

  it('T19: Reject candidate with negative start time (AC1 Boundary)', () => {
    const input = { start: -10, end: 30, now: -20, blocked: defaultBlocked, bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("The start time must be earlier than the end time, and both must be within 00:00–24:00.");
  });

  it('T20: Reject candidate and show custom reason when room is blocked with blockReason (AC3 Boundary)', () => {
    const input = { start: 660, end: 720, now: defaultNow, blocked: true, blockReason: "Maintenance", bookings: defaultBookings };
    expect(canBook(input)).toBe(false);
    expect(getBookingIssues(input)).toContain("Maintenance");
  });

  it('T21: checkAvailability returns structured result with status and empty reasons on available', () => {
    const input = { start: 660, end: 720, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    const res = checkAvailability(input);
    expect(res).toEqual({ status: 'available', reasons: [] });
  });

  it('T22: checkAvailability returns structured result with status and reasons on unavailable', () => {
    const input = { start: 630, end: 690, now: defaultNow, blocked: defaultBlocked, bookings: defaultBookings };
    const res = checkAvailability(input);
    expect(res.status).toBe('unavailable');
    expect(res.reasons.length).toBeGreaterThan(0);
  });
});
