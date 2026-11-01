import { Ban, Calendar } from "lucide-react";
import type { Booking, Room } from "@/types";
import { minutesToHHMM, MINUTES_PER_DAY } from "@/lib/timeUtils";

interface TimelineProps {
  room: Room;
  candidateStart: number | null;
  candidateEnd: number | null;
}

export function Timeline({ room, candidateStart, candidateEnd }: TimelineProps) {
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0..24

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-semibold text-slate-700">Today&apos;s Schedule</h3>
        <span className="text-xs text-slate-400 ml-auto">00:00 → 24:00</span>
      </div>

      {/* Timeline track */}
      <div className="relative h-14 rounded-lg bg-slate-100 overflow-hidden">
        {/* Hour gridlines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}

        {/* Blocked overlay */}
        {room.blocked && (
          <div className="absolute inset-0 bg-rose-100/60 flex items-center justify-center z-20">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <Ban className="w-3.5 h-3.5" /> Room Blocked
            </span>
          </div>
        )}

        {/* Existing bookings */}
        {room.bookings.map((b) => (
          <BookingBar key={b.id} booking={b} />
        ))}

        {/* Candidate interval */}
        {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
          <div
            className="absolute top-0 bottom-0 bg-sky-400/30 border border-sky-500 border-dashed flex items-center justify-center z-10"
            style={{
              left: `${(candidateStart / MINUTES_PER_DAY) * 100}%`,
              width: `${((candidateEnd - candidateStart) / MINUTES_PER_DAY) * 100}%`,
            }}
          >
            <span className="text-[10px] font-semibold text-sky-700 truncate px-1">
              {minutesToHHMM(candidateStart)}–{minutesToHHMM(candidateEnd)}
            </span>
          </div>
        )}
      </div>

      {/* Hour labels */}
      <div className="relative h-5 mt-1">
        {hours.filter((h) => h % 3 === 0).map((h) => (
          <span
            key={h}
            className="absolute text-[10px] text-slate-400 -translate-x-1/2"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {String(h).padStart(2, "0")}
          </span>
        ))}
      </div>

      {/* Booking list */}
      <div className="mt-3 space-y-2">
        {room.bookings.length === 0 ? (
          <p className="text-xs text-slate-400">No existing bookings for this room.</p>
        ) : (
          room.bookings.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-600">{b.purpose}</span>
              <span className="text-slate-400 ml-auto">
                {minutesToHHMM(b.start)} – {minutesToHHMM(b.end)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingBar({ booking }: { booking: Booking }) {
  return (
    <div
      className="absolute top-1 bottom-1 rounded bg-slate-400/90 px-1 flex items-center overflow-hidden"
      style={{
        left: `${(booking.start / MINUTES_PER_DAY) * 100}%`,
        width: `${((booking.end - booking.start) / MINUTES_PER_DAY) * 100}%`,
      }}
      title={`${booking.purpose} — ${booking.bookedBy}`}
    >
      <span className="text-[10px] text-white font-medium truncate">
        {booking.purpose}
      </span>
    </div>
  );
}
