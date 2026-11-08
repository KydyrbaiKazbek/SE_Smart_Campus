import { Info } from "lucide-react";
import type { TimeFormat } from "@/lib/timeUtils";
import { TimeInput } from "@/components/TimeInput";

interface BookingFormProps {
  startRaw: string;
  endRaw: string;
  timeFormat: TimeFormat;
  startError: string | null;
  endError: string | null;
  isRoomSelected: boolean;
  onStartChange: (minutes: number | null, raw: string) => void;
  onEndChange: (minutes: number | null, raw: string) => void;
  onFormatChange: (format: TimeFormat) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function BookingForm({
  startRaw,
  endRaw,
  timeFormat,
  startError,
  endError,
  isRoomSelected,
  onStartChange,
  onEndChange,
  onFormatChange,
  onSubmit,
  onReset,
}: BookingFormProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800">Booking Interval</h2>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => onFormatChange("24h")}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
              timeFormat === "24h"
                ? "bg-white text-sky-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            24h
          </button>
          <button
            onClick={() => onFormatChange("12h")}
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
          onChange={onStartChange}
          error={startError}
        />
        <TimeInput
          label="End"
          value={endRaw}
          format={timeFormat}
          onChange={onEndChange}
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
          disabled={!isRoomSelected}
          onClick={onSubmit}
          className="flex-1 rounded-lg bg-sky-500 text-white text-sm font-semibold py-2.5 hover:bg-sky-600 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          Check Availability
        </button>
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
