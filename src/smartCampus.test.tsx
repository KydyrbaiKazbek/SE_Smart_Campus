import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import App from "./App";
import { canBook, getBookingIssues, checkAvailability } from "./lib/booking";
import { filterRooms } from "./lib/filter";
import type { Room } from "./types";

describe("Smart Campus Automated Test Suite - Task #04", () => {
  /* ==========================================================================
     REGRESSION CHECKS: AC1–AC5 Validation Rules
     ========================================================================== */
  describe("AC1–AC5 Booking & Availability Validation Rules", () => {
    let defaultNow: number;
    let defaultBookings: { id: string; start: number; end: number; purpose: string; bookedBy: string }[];

    beforeEach(() => {
      defaultNow = 540; // 09:00 AM in minutes from midnight
      defaultBookings = [
        { id: "b1", start: 600, end: 660, purpose: "Sprint Sync", bookedBy: "Alice" }, // 10:00–11:00
      ];
    });

    // AC1: Start after current time and within 00:00–24:00
    it("AC1: Accepts booking starting after current time within day bounds, rejects if in past or reversed", () => {
      // Valid start after now (11:00 > 09:00)
      const valid = { start: 660, end: 720, now: defaultNow, blocked: false, bookings: [] };
      expect(canBook(valid)).toBe(true);

      // Past start time (start <= now)
      const inPast = { start: 540, end: 600, now: defaultNow, blocked: false, bookings: [] };
      expect(canBook(inPast)).toBe(false);
      expect(getBookingIssues(inPast)).toContain("The start time must be after the current time.");

      // Reversed start and end
      const reversed = { start: 700, end: 650, now: defaultNow, blocked: false, bookings: [] };
      expect(canBook(reversed)).toBe(false);
      expect(getBookingIssues(reversed)).toContain(
        "The start time must be earlier than the end time, and both must be within 00:00–24:00.",
      );
    });

    // AC2 Boundary: Exactly 120 minutes vs 121 minutes
    it("AC2 Boundary: Accepts interval of exactly 120 minutes, rejects 121 minutes", () => {
      // Exactly 120 minutes (12:00 to 14:00)
      const exactly120 = { start: 720, end: 840, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(exactly120)).toBe(true);
      expect(getBookingIssues(exactly120)).toHaveLength(0);

      // Exactly 121 minutes (12:00 to 14:01)
      const exactly121 = { start: 720, end: 841, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(exactly121)).toBe(false);
      expect(getBookingIssues(exactly121)).toContain(
        "Bookings cannot be longer than 120 minutes (2 hours).",
      );
    });

    // AC3: Blocked room rejection
    it("AC3: Rejects candidate interval when room is blocked and returns custom reason", () => {
      const blockedWithReason = {
        start: 720,
        end: 780,
        now: defaultNow,
        blocked: true,
        blockReason: "Emergency HVAC maintenance",
        bookings: [],
      };
      const result = checkAvailability(blockedWithReason);
      expect(result.status).toBe("unavailable");
      expect(result.reasons).toContain("Emergency HVAC maintenance");
    });

    // AC4 Boundary: Touching intervals vs Overlapping intervals
    it("AC4 Boundary: Accepts touching intervals (before and after), rejects overlapping intervals", () => {
      // Touching BEFORE existing booking (09:30 to 10:00 touches 10:00–11:00)
      const touchBefore = { start: 570, end: 600, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(touchBefore)).toBe(true);

      // Touching AFTER existing booking (11:00 to 12:00 touches 10:00–11:00)
      const touchAfter = { start: 660, end: 720, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(touchAfter)).toBe(true);

      // Overlapping by even 1 minute (10:59 to 11:30 overlaps with 10:00–11:00)
      const overlapOneMin = { start: 659, end: 720, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(overlapOneMin)).toBe(false);
      expect(getBookingIssues(overlapOneMin)[0]).toMatch(/Overlaps with "Sprint Sync"/);

      // Completely inside existing booking (10:15 to 10:45)
      const overlapInside = { start: 615, end: 645, now: defaultNow, blocked: false, bookings: defaultBookings };
      expect(canBook(overlapInside)).toBe(false);
      expect(getBookingIssues(overlapInside)[0]).toMatch(/Overlaps with "Sprint Sync"/);
    });

    // AC5: Empty bookings array & schedule preservation
    it("AC5: Accepts candidate booking when bookings array is empty and preserves original bookings", () => {
      const emptySchedule = { start: 600, end: 660, now: defaultNow, blocked: false, bookings: [] };
      expect(canBook(emptySchedule)).toBe(true);

      const originalSnapshot = JSON.parse(JSON.stringify(defaultBookings));
      const res = checkAvailability({
        start: 720,
        end: 780,
        now: defaultNow,
        blocked: false,
        bookings: defaultBookings,
      });
      expect(res.status).toBe("available");
      expect(defaultBookings).toEqual(originalSnapshot);
    });
  });

  /* ==========================================================================
     NEW FILTERING RULES: F1–F5
     ========================================================================== */
  describe("F1–F5 Catalog Filtering Rules", () => {
    const catalogSample: Room[] = [
      {
        id: "room-small",
        name: "Small Focus Pod",
        building: "Tower A",
        capacity: 10,
        equipment: ["Whiteboard"],
        blocked: false,
        bookings: [],
      },
      {
        id: "room-medium",
        name: "Medium Seminar",
        building: "Tower B",
        capacity: 30,
        equipment: ["Projector", "Whiteboard"],
        blocked: false,
        bookings: [],
      },
      {
        id: "room-large",
        name: "Large Auditorium",
        building: "Tower C",
        capacity: 100,
        equipment: ["Projector", "Sound System", "Microphone", "Video Conference"],
        blocked: false,
        bookings: [],
      },
      {
        id: "room-blocked",
        name: "Maintenance Room",
        building: "Tower D",
        capacity: 50,
        equipment: ["Projector", "Whiteboard"],
        blocked: true,
        blockReason: "Painting",
        bookings: [],
      },
    ];

    // F1 Boundary: Exact capacity vs Insufficient capacity
    it("F1 Boundary: Matches room with exact requested capacity, excludes room with insufficient capacity", () => {
      // Exact capacity: requested 30 attendees
      const exactMatch = filterRooms(catalogSample, { minCapacity: 30 });
      // room-medium (30) matches exact; room-large (100) matches; room-small (10) excluded; room-blocked excluded
      const matchedIds = exactMatch.map((r) => r.id);
      expect(matchedIds).toContain("room-medium");
      expect(matchedIds).toContain("room-large");
      expect(matchedIds).not.toContain("room-small");

      // Insufficient capacity: requested 31 attendees
      const insufficient = filterRooms(catalogSample, { minCapacity: 31 });
      const insufficientIds = insufficient.map((r) => r.id);
      expect(insufficientIds).not.toContain("room-medium"); // 30 < 31 -> excluded
      expect(insufficientIds).toContain("room-large"); // 100 >= 31 -> included
    });

    // F2: Equipment filter contains ALL selected items
    it("F2: Requires rooms to contain ALL selected equipment items (AND logic)", () => {
      // Both Projector and Whiteboard required
      const filterBoth = filterRooms(catalogSample, { equipment: ["Projector", "Whiteboard"] });
      expect(filterBoth.map((r) => r.id)).toEqual(["room-medium"]);

      // Sound System and Microphone required
      const filterAv = filterRooms(catalogSample, { equipment: ["Sound System", "Microphone"] });
      expect(filterAv.map((r) => r.id)).toEqual(["room-large"]);

      // Missing even one item (Projector + Video Conference) excludes room-medium
      const partial = filterRooms(catalogSample, { equipment: ["Projector", "Video Conference"] });
      expect(partial.map((r) => r.id)).toEqual(["room-large"]);
    });

    // F3: Exclude blocked rooms by default
    it("F3: Excludes blocked rooms from filtering results by default", () => {
      // Room-blocked has capacity 50 and Projector/Whiteboard, but blocked: true
      const allActive = filterRooms(catalogSample);
      expect(allActive.some((r) => r.blocked)).toBe(false);
      expect(allActive.map((r) => r.id)).not.toContain("room-blocked");
    });

    // F4: Combination of multiple filters (capacity + multiple equipment)
    it("F4: Combines capacity and multiple equipment filters simultaneously", () => {
      const combined = filterRooms(catalogSample, {
        minCapacity: 25,
        equipment: ["Projector", "Whiteboard"],
      });
      // Only room-medium has capacity >= 25 and both Projector and Whiteboard (room-blocked is blocked)
      expect(combined.map((r) => r.id)).toEqual(["room-medium"]);
    });

    // F5: Empty state when no rooms match
    it("F5: Returns an empty array when no rooms satisfy capacity or equipment criteria", () => {
      // Capacity exceeds largest room
      const overCapacity = filterRooms(catalogSample, { minCapacity: 500 });
      expect(overCapacity).toEqual([]);

      // Equipment combination that no room has
      const nonExistentEq = filterRooms(catalogSample, {
        equipment: ["Whiteboard", "Microphone"],
      });
      expect(nonExistentEq).toEqual([]);
    });
  });

  /* ==========================================================================
     UI BEHAVIOR & INTEGRATION TESTS
     ========================================================================== */
  describe("UI Behavior & Component Integration", () => {
    it("UI-1: Typing in requested attendees updates the visible room list and displays empty state when none match", () => {
      render(<App />);

      const attendeeInput = screen.getByPlaceholderText(/e\.g\. 25/i);

      // Enter capacity requirement of 45 attendees
      fireEvent.change(attendeeInput, { target: { value: "45" } });

      // Room A101 (Lecture Hall, 50 seats) should be visible
      expect(screen.getByText(/Room A101/i)).toBeInTheDocument();

      // Room B205 (Collab Lab, 25 seats) should be filtered out
      expect(screen.queryByText(/Room B205/i)).not.toBeInTheDocument();

      // Enter impossible attendee count (e.g. 500)
      fireEvent.change(attendeeInput, { target: { value: "500" } });

      // Clear empty state should be rendered
      expect(screen.getByText(/No rooms match your filters/i)).toBeInTheDocument();
      expect(screen.getByText(/No Room Selected/i)).toBeInTheDocument();
    });

    it("UI-2: Changing selected room automatically refreshes the availability result banner", () => {
      render(<App />);

      // Initially click "Check Availability"
      const checkBtn = screen.getByRole("button", { name: /check availability/i });
      fireEvent.click(checkBtn);

      // Verify availability banner is visible for default room (Room A101 is available 14:00–15:00)
      expect(screen.getByText(/Room A101 \(Lecture Hall\) is free from 14:00 to 15:00/i)).toBeInTheDocument();

      // Click Room B205 (Collab Lab), which has a conflicting booking at 14:00 (840) to 15:00 (900)
      const roomBButton = screen.getByText(/Room B205 \(Collab Lab\)/i).closest("button")!;
      fireEvent.click(roomBButton);

      // Availability result banner automatically refreshes to Unavailable with conflict reason
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
      expect(screen.getByText(/Overlaps with "Office Hours"/i)).toBeInTheDocument();
    });
  });
});
