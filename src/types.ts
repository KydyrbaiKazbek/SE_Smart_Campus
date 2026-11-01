export interface Booking {
  id: string;
  start: number; // minutes from midnight (0–1440)
  end: number; // minutes from midnight (0–1440)
  bookedBy: string;
  purpose: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export type CheckStatus = "available" | "unavailable";

export interface CheckResult {
  status: CheckStatus;
  reasons: string[]; // empty when available; one or more rejection reasons when unavailable
}
