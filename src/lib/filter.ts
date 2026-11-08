import type { Room, RoomFilterOptions } from "@/types";

/**
 * Extracts all unique equipment items from a catalog of rooms, sorted alphabetically.
 */
export function getAvailableEquipment(rooms: Room[]): string[] {
  const set = new Set<string>();
  rooms.forEach((r) => r.equipment.forEach((eq) => set.add(eq)));
  return Array.from(set).sort();
}

/**
 * Filters a catalog of rooms based on:
 * 1. Blocked status (blocked rooms are excluded by default)
 * 2. Capacity (room.capacity >= requestedAttendees)
 * 3. Equipment (room must contain ALL requested equipment items)
 *
 * @param rooms Array of rooms to filter
 * @param options Filter options including minCapacity, equipment, and includeBlocked
 * @returns Filtered array of rooms matching all criteria
 */
export function filterRooms(rooms: Room[], options: RoomFilterOptions = {}): Room[] {
  const { minCapacity = 0, equipment = [], includeBlocked = false } = options;

  return rooms.filter((room) => {
    // Exclude blocked rooms
    if (!includeBlocked && room.blocked) {
      return false;
    }

    // Filter by capacity: capacity >= requested attendees
    if (minCapacity > 0 && room.capacity < minCapacity) {
      return false;
    }

    // Filter by equipment: room must contain all selected items
    if (equipment.length > 0) {
      const roomEquipmentNormalized = room.equipment.map((item) => item.trim().toLowerCase());
      const hasAllEquipment = equipment.every((req) =>
        roomEquipmentNormalized.includes(req.trim().toLowerCase()),
      );
      if (!hasAllEquipment) {
        return false;
      }
    }

    return true;
  });
}
