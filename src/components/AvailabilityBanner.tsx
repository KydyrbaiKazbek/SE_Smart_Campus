import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { CheckResult } from "@/types";
import { formatMinutes, type TimeFormat } from "@/lib/timeUtils";

interface AvailabilityBannerProps {
  result: CheckResult | null;
  roomName: string;
  startMinutes: number | null;
  endMinutes: number | null;
  timeFormat: TimeFormat;
}

export function AvailabilityBanner({
  result,
  roomName,
  startMinutes,
  endMinutes,
  timeFormat,
}: AvailabilityBannerProps) {
  return (
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
              {roomName} is free from{" "}
              {startMinutes !== null ? formatMinutes(startMinutes, timeFormat) : ""}{" "}
              to {endMinutes !== null ? formatMinutes(endMinutes, timeFormat) : ""}.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-base font-bold text-rose-700">Unavailable</p>
            <ul className="mt-1 space-y-1">
              {result.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-rose-600 flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
