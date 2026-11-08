import { SearchX, RotateCcw } from "lucide-react";
import type { Room } from "@/types";
import { RoomCard } from "@/components/RoomCard";

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (room: Room) => void;
  onResetFilters: () => void;
}

export function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onResetFilters,
}: RoomListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">Available Rooms</h2>

      {rooms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center bg-slate-50/50">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No rooms match your filters</p>
          <p className="text-xs text-slate-500 mt-1">
            Try reducing requested attendees or removing equipment requirements.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
          >
            <RotateCcw className="w-3 h-3" /> Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={room.id === selectedRoomId}
              onSelect={onSelectRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
