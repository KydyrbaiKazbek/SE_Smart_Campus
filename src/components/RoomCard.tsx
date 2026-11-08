import { Building2, Users, Lock } from "lucide-react";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (room: Room) => void;
}

export function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
  return (
    <button
      onClick={() => onSelect(room)}
      className={`w-full text-left rounded-lg border px-3.5 py-3 transition ${
        isSelected
          ? "border-sky-400 bg-sky-50/80 ring-1 ring-sky-300"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
            isSelected ? "border-sky-500 bg-sky-500" : "border-slate-300"
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
}
