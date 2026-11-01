import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Building2, Users, Lock, Clock3, Info } from "lucide-react";
import { rooms as sampleRooms } from "@/data/sampleData";
import { canBook, getBookingIssues } from "@/lib/booking";
import { hhmmToMinutes, minutesToHHMM, minutesTo12h, nowInMinutes, type TimeFormat } from "@/lib/timeUtils";
import type { CheckResult } from "@/types";
import { TimeInput } from "@/components/TimeInput";
import { Timeline } from "@/components/Timeline";

function App() {
  const [rooms] = useState(sampleRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(sampleRooms[0].id);

  const [startRaw, setStartRaw] = useState("14:00");
  const [endRaw, setEndRaw] = useState("15:00");
  const [currentTime, setCurrentTime] = useState(nowInMinutes());
  const [result, setResult] = useState<CheckResult | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId)!,
    [rooms, selectedRoomId],
  );

  const startMinutes = startRaw ? hhmmToMinutes(startRaw) : null;
  const endMinutes = endRaw ? hhmmToMinutes(endRaw) : null;

  const handleCheck = () => {
    let sErr: string | null = null;
    let eErr: string | null = null;

    if (startMinutes === null) sErr = "Enter a valid start time (HH:MM).";
    if (endMinutes === null) eErr = "Enter a valid end time (HH:MM).";

    setStartError(sErr);
    setEndError(eErr);

    if (sErr || eErr) {
      setResult(null);
      return;
    }

    // Refresh current time on each check (AC1: start must be after supplied current time)
    const now = nowInMinutes();
    setCurrentTime(now);
    const input = {
      start: startMinutes!,
      end: endMinutes!,
      now,
      blocked: selectedRoom.blocked,
      blockReason: selectedRoom.blockReason,
      bookings: selectedRoom.bookings,
    };
    setResult(
      canBook(input)
        ? { status: "available", reasons: [] }
        : { status: "unavailable", reasons: getBookingIssues(input) },
    );
  };

  const handleReset = () => {
    setStartRaw("14:00");
    setEndRaw("15:00");
    setStartError(null);
    setEndError(null);
    setResult(null);
  };

  const currentLabel = timeFormat === "12h" ? minutesTo12h(currentTime) : minutesToHHMM(currentTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              Smart Campus Room Checker
            </h1>
            <p className="text-xs text-slate-400">Check room availability — prototype demo</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            <span className="font-medium tabular-nums">{currentLabel}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: controls */}
          <section className="lg:col-span-2 space-y-5">
            {/* Room selector */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Select a Room</h2>
              <div className="space-y-2">
                {rooms.map((room) => {
                  const active = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setResult(null);
                      }}
                      className={`w-full text-left rounded-lg border px-3.5 py-3 transition
                        ${active
                          ? "border-sky-400 bg-sky-50 ring-1 ring-sky-300"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0
                          ${active ? "border-sky-500 bg-sky-500" : "border-slate-300"}`} />
                        <span className="text-sm font-semibold text-slate-800">{room.name}</span>
                        {room.blocked && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-100 rounded px-1.5 py-0.5 ml-auto">
                            <Lock className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-6 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Building2 className="w-3 h-3" /> {room.building}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {room.capacity} seats
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time inputs */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">Booking Interval</h2>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition
                      ${timeFormat === "24h" ? "bg-white text-sky-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    24h
                  </button>
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition
                      ${timeFormat === "12h" ? "bg-white text-sky-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    12h (AM/PM)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TimeInput
                  label="Start"
                  value={startRaw}
                  format={timeFormat}
                  onChange={(m, raw) => {
                    setStartRaw(raw);
                    setStartError(m === null && raw ? "Invalid time." : null);
                    setResult(null);
                  }}
                  error={startError}
                />
                <TimeInput
                  label="End"
                  value={endRaw}
                  format={timeFormat}
                  onChange={(m, raw) => {
                    setEndRaw(raw);
                    setEndError(m === null && raw ? "Invalid time." : null);
                    setResult(null);
                  }}
                  error={endError}
                />
              </div>

              <p className="text-xs text-slate-400 mt-2.5 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {timeFormat === "12h"
                  ? "Enter times like 2:00 PM. Max 2 hours per booking. Touching endpoints are allowed."
                  : "Times are in 24-hour format. Max 2 hours per booking. Touching endpoints are allowed."}
              </p>

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={handleCheck}
                  className="flex-1 rounded-lg bg-sky-500 text-white text-sm font-semibold py-2.5
                    hover:bg-sky-600 active:bg-sky-700 transition shadow-sm"
                >
                  Check Availability
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5
                    hover:bg-slate-50 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Right: result + timeline */}
          <section className="lg:col-span-3 space-y-5">
            {/* Result panel */}
            <div
              className={`rounded-xl border p-4 sm:p-5 transition
                ${result?.status === "available"
                  ? "border-emerald-200 bg-emerald-50"
                  : result?.status === "unavailable"
                    ? "border-rose-200 bg-rose-50"
                    : "border-slate-200 bg-white"}`}
            >
              {result === null ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    Pick a room and time interval, then press <span className="font-semibold">Check Availability</span>.
                  </p>
                </div>
              ) : result.status === "available" ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-bold text-emerald-700">Available</p>
                    <p className="text-sm text-emerald-600 mt-0.5">
                      {selectedRoom.name} is free from {timeFormat === "12h" ? minutesTo12h(startMinutes!) : minutesToHHMM(startMinutes!)} to {timeFormat === "12h" ? minutesTo12h(endMinutes!) : minutesToHHMM(endMinutes!)}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-base font-bold text-rose-700">Unavailable</p>
                    <ul className="mt-1 space-y-1">
                      {result.reasons.map((r, i) => (
                        <li key={i} className="text-sm text-rose-600 flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <Timeline
              room={selectedRoom}
              candidateStart={startMinutes}
              candidateEnd={endMinutes}
            />

            {/* Blocked notice */}
            {selectedRoom.blocked && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-700">This room is blocked</p>
                  <p className="text-xs text-rose-600 mt-0.5">{selectedRoom.blockReason}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Prototype only — uses fictional sample data. No booking is saved or confirmed.
        </footer>
      </main>
    </div>
  );
}

export default App;
