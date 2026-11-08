import { Building2, Clock3 } from "lucide-react";
import { formatMinutes, type TimeFormat } from "@/lib/timeUtils";

interface HeaderProps {
  currentTime: number;
  timeFormat: TimeFormat;
}

export function Header({ currentTime, timeFormat }: HeaderProps) {
  return (
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
          <span className="font-medium tabular-nums">
            {formatMinutes(currentTime, timeFormat)}
          </span>
        </div>
      </div>
    </header>
  );
}
