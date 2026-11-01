import type { Room } from "@/types";

export const rooms: Room[] = [
  {
    id: "room-a101",
    name: "Room A101",
    building: "Engineering Block",
    capacity: 40,
    blocked: false,
    bookings: [
      { id: "b1", start: 540, end: 600, bookedBy: "Dr. Chen", purpose: "Calculus Lecture" },
      { id: "b2", start: 720, end: 780, bookedBy: "Study Group B", purpose: "Project Meeting" },
      { id: "b3", start: 900, end: 960, bookedBy: "Prof. Smith", purpose: "Faculty Seminar" },
    ],
  },
  {
    id: "room-b205",
    name: "Room B205",
    building: "Science Wing",
    capacity: 25,
    blocked: false,
    bookings: [
      { id: "b4", start: 480, end: 540, bookedBy: "Lab Team A", purpose: "Chemistry Prep" },
      { id: "b5", start: 840, end: 900, bookedBy: "Dr. Patel", purpose: "Office Hours" },
    ],
  },
  {
    id: "room-c310",
    name: "Room C310",
    building: "Library Tower",
    capacity: 12,
    blocked: true,
    blockReason: "Room is closed for maintenance and unavailable for booking today.",
    bookings: [
      { id: "b6", start: 600, end: 660, bookedBy: "Book Club", purpose: "Weekly Reading" },
    ],
  },
  {
    id: "room-d102",
    name: "Room D102",
    building: "Business Center",
    capacity: 60,
    blocked: false,
    bookings: [
      { id: "b7", start: 630, end: 690, bookedBy: "MBA Cohort", purpose: "Case Study" },
      { id: "b8", start: 810, end: 870, bookedBy: "Career Services", purpose: "Workshop" },
      { id: "b9", start: 960, end: 1020, bookedBy: "Alumni Office", purpose: "Networking Event" },
    ],
  },
];
