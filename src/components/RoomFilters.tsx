import { Filter, Users, Sparkles, Check, RotateCcw } from "lucide-react";

interface RoomFiltersProps {
  attendeesInput: string;
  onAttendeesChange: (val: string) => void;
  selectedEquipment: string[];
  allEquipment: string[];
  onToggleEquipment: (eq: string) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalRooms: number;
  matchingRoomsCount: number;
}

export function RoomFilters({
  attendeesInput,
  onAttendeesChange,
  selectedEquipment,
  allEquipment,
  onToggleEquipment,
  onResetFilters,
  isFiltered,
  totalRooms,
  matchingRoomsCount,
}: RoomFiltersProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-semibold text-slate-800">Filter Catalog</h2>
        </div>
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Attendees / Min Capacity */}
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
          onChange={(e) => onAttendeesChange(e.target.value)}
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Equipment Multi-select */}
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
                onClick={() => onToggleEquipment(eq)}
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
          Showing {matchingRoomsCount} of {totalRooms} rooms
        </span>
        <span className="font-medium text-slate-500">Blocked rooms excluded</span>
      </div>
    </div>
  );
}
