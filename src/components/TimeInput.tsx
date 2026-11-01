import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  hhmmToMinutes,
  minutesToHHMM,
  minutesTo12h,
  parse12h,
  type TimeFormat,
} from "@/lib/timeUtils";

interface TimeInputProps {
  label: string;
  value: string; // "HH:MM" (24h internal, the source of truth from parent)
  format: TimeFormat;
  onChange: (minutes: number | null, raw24h: string) => void;
  error?: string | null;
}

export function TimeInput({ label, value, format, onChange, error }: TimeInputProps) {
  // Local display state so partial typing works without the parent resetting it.
  const [display, setDisplay] = useState("");

  // Sync local display when the parent's value changes externally (e.g. reset, format switch).
  useEffect(() => {
    if (!value) {
      setDisplay("");
      return;
    }
    if (format === "12h") {
      const m = hhmmToMinutes(value);
      setDisplay(m !== null ? minutesTo12h(m) : "");
    } else {
      setDisplay(value);
    }
  }, [value, format]);

  /** 24h: auto-insert ':' after the first 2 digits, keep only digits + colon. */
  const format24hInput = (raw: string): string => {
    const digits = raw.replace(/[^\d]/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handle24hChange = (raw: string) => {
    const formatted = format24hInput(raw);
    setDisplay(formatted);
    const minutes = formatted.length >= 4 ? hhmmToMinutes(formatted) : null;
    onChange(minutes, minutes !== null ? minutesToHHMM(minutes) : "");
  };

  const handle12hChange = (raw: string) => {
    const upper = raw.toUpperCase();
    setDisplay(upper);
    const minutes = parse12h(upper);
    onChange(minutes, minutes !== null ? minutesToHHMM(minutes) : "");
  };

  const baseInputClass = `w-full rounded-lg border px-3 py-2.5 text-slate-900 text-sm
    focus:outline-none focus:ring-2 transition
    ${error
      ? "border-rose-300 focus:ring-rose-300 bg-rose-50"
      : "border-slate-200 focus:ring-sky-300 bg-white"}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-slate-400" />
        {label}
      </label>
      {format === "12h" ? (
        <input
          type="text"
          inputMode="text"
          placeholder="2:00 PM"
          value={display}
          onChange={(e) => handle12hChange(e.target.value)}
          className={baseInputClass}
        />
      ) : (
        <input
          type="text"
          inputMode="numeric"
          placeholder="14:00"
          value={display}
          onChange={(e) => handle24hChange(e.target.value)}
          className={baseInputClass}
        />
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
