import { useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
  Lock,
  Clock3,
  Info,
  Filter,
  Check,
  RotateCcw,
  SearchX,
  Sparkles,
} from "lucide-react";
import { rooms as sampleRooms } from "@/data/sampleData";
import { canBook, getBookingIssues } from "@/lib/booking";
import { filterRooms } from "@/lib/filter";
import {
  hhmmToMinutes,
  minutesToHHMM,
  minutesTo12h,
  nowInMinutes,
  type TimeFormat,
} from "@/lib/timeUtils";
import type { CheckResult, Room } from "@/types";
import { TimeInput } from "@/components/TimeInput";
import { Timeline } from "@/components/Timeline";

function App() {
  const [rooms] = useState<Room[]>(sampleRooms);

  // Filter states
  const [attendeesInput, setAttendeesInput] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Time & booking states
  const [startRaw, setStartRaw] = useState("14:00");
  const [endRaw, setEndRaw] = useState("15:00");
  const [currentTime, setCurrentTime] = useState(nowInMinutes());
  const [result, setResult] = useState<CheckResult | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [hasChecked, setHasChecked] = useState(false);

  // Unique equipment items across all catalog rooms
  const allEquipment = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => r.equipment.forEach((eq) => set.add(eq)));
    return Array.from(set).sort();
  }, [rooms]);

  // Filtered rooms: capacity >= attendees, equipment contains all, blocked excluded
  const requestedAttendees = attendeesInput ? Math.max(0, parseInt(attendeesInput, 10) || 0) : 0;
  const filteredRooms = useMemo(() => {
    return filterRooms(rooms, {
      minCapacity: requestedAttendees,
      equipment: selectedEquipment,
      includeBlocked: false,
    });
  }, [rooms, requestedAttendees, selectedEquipment]);

  // Selected room ID (defaults to first filtered room)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    filteredRooms[0]?.id ?? null,
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  const startMinutes = startRaw ? hhmmToMinutes(startRaw) : null;
  const endMinutes = endRaw ? hhmmToMinutes(endRaw) : null;

  // Evaluate booking availability for a specific room
  const checkAvailabilityForRoom = (room: Room, refreshClock = true) => {
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

    const now = refreshClock ? nowInMinutes() : currentTime;
    setCurrentTime(now);

    const input = {
      start: startMinutes!,
      end: endMinutes!,
      now,
      blocked: room.blocked,
      blockReason: room.blockReason,
      bookings: room.bookings,
    };

    setResult(
      canBook(input)
        ? { status: "available", reasons: [] }
        : { status: "unavailable", reasons: getBookingIssues(input) },
    );
  };

  // Keep selectedRoomId in sync when filter results change
  useEffect(() => {
    if (filteredRooms.length === 0) {
      setSelectedRoomId(null);
      setResult(null);
    } else if (!selectedRoomId || !filteredRooms.some((r) => r.id === selectedRoomId)) {
      const nextRoom = filteredRooms[0];
      setSelectedRoomId(nextRoom.id);
      if (hasChecked || result !== null) {
        checkAvailabilityForRoom(nextRoom);
      }
    }
  }, [filteredRooms, selectedRoomId, hasChecked, result]);

  // Changing room refreshes the availability result
  const handleSelectRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    // Refresh availability result for the newly selected room
    checkAvailabilityForRoom(room);
  };

  const handleCheck = () => {
    setHasChecked(true);
    if (!selectedRoom) return;
    checkAvailabilityForRoom(selectedRoom, true);
  };

  const handleResetFilters = () => {
    setAttendeesInput("");
    setSelectedEquipment([]);
  };

  const handleResetForm = () => {
    setStartRaw("14:00");
    setEndRaw("15:00");
    setStartError(null);
    setEndError(null);
    setResult(null);
    setHasChecked(false);
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq],
    );
  };

  const isFiltered = attendeesInput !== "" || selectedEquipment.length > 0;
  const currentLabel =
    timeFormat === "12h" ? minutesTo12h(currentTime) : minutesToHHMM(currentTime);

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
            <p className="text-xs text-slate-400">
              Interactive room catalog, filtering, and availability checker
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            <span className="font-medium tabular-nums">{currentLabel}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left column: Filters & Room selection & Time */}
          <section className="lg:col-span-2 space-y-5">
            {/* Filter controls */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Filter Catalog</h2>
                </div>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Attendees / Capacity filter */}
              <div className="space-y-1.5 mb-3.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Requested Attendees (Min Capacity)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Equipment multi-select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Required Equipment (Must contain all)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allEquipment.map((eq) => {
                    const isSelected = selectedEquipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Showing {filteredRooms.length} of {rooms.length} rooms
                </span>
                <span className="font-medium text-slate-500">Blocked rooms excluded</span>
              </div>
            </div>

            {/* Room list */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Available Rooms</h2>

              {filteredRooms.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center bg-slate-50/50">
                  <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No rooms match your filters</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try reducing requested attendees or removing equipment requirements.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRooms.map((room) => {
                    const active = room.id === selectedRoomId;
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleSelectRoom(room)}
                        className={`w-full text-left rounded-lg border px-3.5 py-3 transition ${
                          active
                            ? "border-sky-400 bg-sky-50/80 ring-1 ring-sky-300"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                              active ? "border-sky-500 bg-sky-500" : "border-slate-300"
                            }`}
                          />
                          <span className="text-sm font-semibold text-slate-800">{room.name}</span>
                          {room.blocked && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 bg-rose-100 rounded px-1.5 py-0.5 ml-auto">
                              <Lock className="w-3 h-3" /> Blocked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-6 text-xs text-slate-500">
                          <span className="flex items-center gap-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" /> {room.building}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3 text-slate-400" /> {room.capacity} seats
                          </span>
                        </div>
                        {room.equipment.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 ml-6">
                            {room.equipment.map((eq) => (
                              <span
                                key={eq}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time inputs */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Booking Interval</h2>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
                      timeFormat === "24h"
                        ? "bg-white text-sky-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    24h
                  </button>
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
                      timeFormat === "12h"
                        ? "bg-white text-sky-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
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
                    setHasChecked(false);
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
                    setHasChecked(false);
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
                  disabled={!selectedRoom}
                  onClick={handleCheck}
                  className="flex-1 rounded-lg bg-sky-500 text-white text-sm font-semibold py-2.5 hover:bg-sky-600 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Check Availability
                </button>
                <button
                  onClick={handleResetForm}
                  className="rounded-lg border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Right column: Availability result + timeline */}
          <section className="lg:col-span-3 space-y-5">
            {selectedRoom ? (
              <>
                {/* Result panel */}
                <div
                  className={`rounded-xl border p-4 sm:p-5 transition shadow-sm ${
                    result?.status === "available"
                      ? "border-emerald-200 bg-emerald-50"
                      : result?.status === "unavailable"
                        ? "border-rose-200 bg-rose-50"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  {result === null ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Info className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        Pick a room and time interval, then press{" "}
                        <span className="font-semibold text-slate-600">Check Availability</span>.
                      </p>
                    </div>
                  ) : result.status === "available" ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-bold text-emerald-700">Available</p>
                        <p className="text-sm text-emerald-600 mt-0.5">
                          {selectedRoom.name} is free from{" "}
                          {timeFormat === "12h"
                            ? minutesTo12h(startMinutes!)
                            : minutesToHHMM(startMinutes!)}{" "}
                          to{" "}
                          {timeFormat === "12h"
                            ? minutesTo12h(endMinutes!)
                            : minutesToHHMM(endMinutes!)}
                          .
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
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 shadow-sm">
                    <Lock className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-700">This room is blocked</p>
                      <p className="text-xs text-rose-600 mt-0.5">{selectedRoom.blockReason}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 sm:p-12 text-center shadow-sm">
                <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No Room Selected</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  All rooms were filtered out by your attendee count or equipment criteria. Adjust or
                  reset your filters to view schedules and check availability.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Catalog Filters
                </button>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Smart Campus Prototype — Task #02 Extended Catalog & Filtering
        </footer>
      </main>
    </div>
  );
}

export default App;
