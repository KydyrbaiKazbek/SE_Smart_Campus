import { describe, it, expect } from "vitest";
import { filterRooms, getAvailableEquipment } from "./filter";
import type { Room } from "@/types";

describe("Room Filtering Logic", () => {
  const testRooms: Room[] = [
    {
      id: "r1",
      name: "Room 1",
      building: "B1",
      capacity: 10,
      equipment: ["Projector", "Whiteboard"],
      blocked: false,
      bookings: [],
    },
    {
      id: "r2",
      name: "Room 2",
      building: "B1",
      capacity: 30,
      equipment: ["Projector", "Whiteboard", "Video Conference"],
      blocked: false,
      bookings: [],
    },
    {
      id: "r3",
      name: "Room 3",
      building: "B2",
      capacity: 50,
      equipment: ["Whiteboard", "TV Display"],
      blocked: true,
      blockReason: "Maintenance",
      bookings: [],
    },
    {
      id: "r4",
      name: "Room 4",
      building: "B3",
      capacity: 40,
      equipment: ["Sound System", "Microphone", "Projector"],
      blocked: false,
      bookings: [],
    },
  ];

  it("excludes blocked rooms by default", () => {
    const result = filterRooms(testRooms);
    expect(result.some((r) => r.id === "r3")).toBe(false);
    expect(result.map((r) => r.id)).toEqual(["r1", "r2", "r4"]);
  });

  it("filters rooms by capacity (capacity >= requested attendees)", () => {
    const result = filterRooms(testRooms, { minCapacity: 30 });
    expect(result.map((r) => r.id)).toEqual(["r2", "r4"]);
  });

  it("filters rooms by single equipment requirement", () => {
    const result = filterRooms(testRooms, { equipment: ["Video Conference"] });
    expect(result.map((r) => r.id)).toEqual(["r2"]);
  });

  it("filters rooms by multiple equipment items (must contain ALL selected items)", () => {
    const result = filterRooms(testRooms, { equipment: ["Projector", "Whiteboard"] });
    expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("rejects rooms missing even one of the required equipment items", () => {
    const result = filterRooms(testRooms, {
      equipment: ["Projector", "Whiteboard", "Sound System"],
    });
    expect(result).toHaveLength(0);
  });

  it("combines capacity and equipment filters simultaneously", () => {
    const result = filterRooms(testRooms, {
      minCapacity: 25,
      equipment: ["Projector"],
    });
    expect(result.map((r) => r.id)).toEqual(["r2", "r4"]);
  });

  it("returns an empty array when no rooms match capacity", () => {
    const result = filterRooms(testRooms, { minCapacity: 100 });
    expect(result).toHaveLength(0);
  });

  it("matches equipment case-insensitively", () => {
    const result = filterRooms(testRooms, { equipment: ["PROJECTOR", "whiteboard"] });
    expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("can include blocked rooms if explicitly requested via includeBlocked: true", () => {
    const result = filterRooms(testRooms, { minCapacity: 50, includeBlocked: true });
    expect(result.map((r) => r.id)).toEqual(["r3"]);
  });

  it("getAvailableEquipment extracts unique, sorted equipment across all rooms", () => {
    const equipment = getAvailableEquipment(testRooms);
    expect(equipment).toEqual([
      "Microphone",
      "Projector",
      "Sound System",
      "TV Display",
      "Video Conference",
      "Whiteboard",
    ]);
  });
});
