import { SearchX, RotateCcw } from "lucide-react";

interface NoRoomSelectedProps {
  onResetFilters: () => void;
}

export function NoRoomSelected({ onResetFilters }: NoRoomSelectedProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 sm:p-12 text-center shadow-sm">
      <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-slate-700">No Room Selected</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
        All rooms were filtered out by your attendee count or equipment criteria. Adjust or reset
        your filters to view schedules and check availability.
      </p>
      <button
        onClick={onResetFilters}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-lg transition"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reset Catalog Filters
      </button>
    </div>
  );
}
