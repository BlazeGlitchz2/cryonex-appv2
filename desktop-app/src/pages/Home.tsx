import { Activity, CalendarClock, LayoutDashboard, TimerReset } from "lucide-react";
import { StudyAccountabilityPanel } from "../components/StudyAccountabilityPanel";

export function Home() {
  return (
    <div className="p-8 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
          <LayoutDashboard size={12} />
          Dashboard
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Study command center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Keep your focus block, break windows, school board updates, and
              accountability reminders visible in one calm place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-cyan-200">
                <CalendarClock size={14} />
                Board
              </div>
              <p className="mt-2 font-semibold">Live-ready</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-violet-200">
                <TimerReset size={14} />
                Breaks
              </div>
              <p className="mt-2 font-semibold">Tracked</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-200">
                <Activity size={14} />
                Alerts
              </div>
              <p className="mt-2 font-semibold">Desktop + fallback</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            System Status
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-400">Good</span>
            <span className="text-sm text-gray-400 mb-1">Optimized</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Assistant
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-400">Ready</span>
            <span className="text-sm text-gray-400 mb-1">v2.0 Connected</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            Pending Updates
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-yellow-400">2</span>
            <span className="text-sm text-gray-400 mb-1">Apps available</span>
          </div>
        </div>
      </div>

      <StudyAccountabilityPanel />
    </div>
  );
}
