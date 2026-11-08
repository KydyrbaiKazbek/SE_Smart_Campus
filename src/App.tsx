import { useMemo, useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { rooms as sampleRooms } from "@/data/sampleData";
import { checkAvailability } from "@/lib/booking";
import { filterRooms, getAvailableEquipment } from "@/lib/filter";
import { hhmmToMinutes, nowInMinutes, type TimeFormat } from "@/lib/timeUtils";
import type { CheckResult, Room } from "@/types";
import { Header } from "@/components/Header";
import { RoomFilters } from "@/components/RoomFilters";
import { RoomList } from "@/components/RoomList";
import { BookingForm } from "@/components/BookingForm";
import { AvailabilityBanner } from "@/components/AvailabilityBanner";
import { Timeline } from "@/components/Timeline";
import { NoRoomSelected } from "@/components/NoRoomSelected";

function App() {
  const [rooms] = useState<Room[]>(sampleRooms);

  // Filter states
  const [attendeesInput, setAttendeesInput] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Time & booking interval states
  const [startRaw, setStartRaw] = useState("14:00");
  const [endRaw, setEndRaw] = useState("15:00");
  const [currentTime, setCurrentTime] = useState(nowInMinutes());
  const [result, setResult] = useState<CheckResult | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [hasChecked, setHasChecked] = useState(false);

  // Available equipment options extracted from the room catalog
  const allEquipment = useMemo(() => getAvailableEquipment(rooms), [rooms]);

  // Filtered catalog
  const requestedAttendees = attendeesInput ? Math.max(0, parseInt(attendeesInput, 10) || 0) : 0;
  const filteredRooms = useMemo(() => {
    return filterRooms(rooms, {
      minCapacity: requestedAttendees,
      equipment: selectedEquipment,
      includeBlocked: false,
    });
  }, [rooms, requestedAttendees, selectedEquipment]);

  // Selected room ID
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    filteredRooms[0]?.id ?? null,
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  const startMinutes = startRaw ? hhmmToMinutes(startRaw) : null;
  const endMinutes = endRaw ? hhmmToMinutes(endRaw) : null;

  // Single-pass availability evaluation
  const evaluateAvailability = (room: Room, refreshClock = true) => {
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

    const checkResult = checkAvailability({
      start: startMinutes!,
      end: endMinutes!,
      now,
      blocked: room.blocked,
      blockReason: room.blockReason,
      bookings: room.bookings,
    });

    setResult(checkResult);
  };

  // Sync selectedRoomId when filters alter matching rooms
  useEffect(() => {
    if (filteredRooms.length === 0) {
      setSelectedRoomId(null);
      setResult(null);
    } else if (!selectedRoomId || !filteredRooms.some((r) => r.id === selectedRoomId)) {
      const nextRoom = filteredRooms[0];
      setSelectedRoomId(nextRoom.id);
      if (hasChecked || result !== null) {
        evaluateAvailability(nextRoom);
      }
    }
  }, [filteredRooms, selectedRoomId, hasChecked, result]);

  // Changing selected room refreshes availability result
  const handleSelectRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    evaluateAvailability(room);
  };

  const handleCheck = () => {
    setHasChecked(true);
    if (selectedRoom) {
      evaluateAvailability(selectedRoom, true);
    }
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

  const handleToggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq],
    );
  };

  const isFiltered = attendeesInput !== "" || selectedEquipment.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100">
      <Header currentTime={currentTime} timeFormat={timeFormat} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Controls Column */}
          <section className="lg:col-span-2 space-y-5">
            <RoomFilters
              attendeesInput={attendeesInput}
              onAttendeesChange={setAttendeesInput}
              selectedEquipment={selectedEquipment}
              allEquipment={allEquipment}
              onToggleEquipment={handleToggleEquipment}
              onResetFilters={handleResetFilters}
              isFiltered={isFiltered}
              totalRooms={rooms.length}
              matchingRoomsCount={filteredRooms.length}
            />

            <RoomList
              rooms={filteredRooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={handleSelectRoom}
              onResetFilters={handleResetFilters}
            />

            <BookingForm
              startRaw={startRaw}
              endRaw={endRaw}
              timeFormat={timeFormat}
              startError={startError}
              endError={endError}
              isRoomSelected={selectedRoom !== null}
              onStartChange={(m, raw) => {
                setStartRaw(raw);
                setStartError(m === null && raw ? "Invalid time." : null);
                setResult(null);
                setHasChecked(false);
              }}
              onEndChange={(m, raw) => {
                setEndRaw(raw);
                setEndError(m === null && raw ? "Invalid time." : null);
                setResult(null);
                setHasChecked(false);
              }}
              onFormatChange={setTimeFormat}
              onSubmit={handleCheck}
              onReset={handleResetForm}
            />
          </section>

          {/* Results Column */}
          <section className="lg:col-span-3 space-y-5">
            {selectedRoom ? (
              <>
                <AvailabilityBanner
                  result={result}
                  roomName={selectedRoom.name}
                  startMinutes={startMinutes}
                  endMinutes={endMinutes}
                  timeFormat={timeFormat}
                />

                <Timeline
                  room={selectedRoom}
                  candidateStart={startMinutes}
                  candidateEnd={endMinutes}
                />

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
              <NoRoomSelected onResetFilters={handleResetFilters} />
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
