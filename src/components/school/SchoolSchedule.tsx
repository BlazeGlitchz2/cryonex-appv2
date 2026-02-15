import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Clock, MapPin, CalendarDays } from "lucide-react";

type ClassSession = {
    id: string;
    subject: string;
    time: string;
    location: string;
    teacher?: string;
    color?: string;
};

// Mock schedule data (Would come from backend/config eventually)
const MOCK_SCHEDULE: Record<string, ClassSession[]> = {
    sunday: [
        { id: "1", subject: "Mathematics (Set 1)", time: "07:30 - 08:30", location: "Room 101", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
        { id: "2", subject: "Physics (IGCSE)", time: "08:30 - 09:30", location: "Lab 3", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
        { id: "3", subject: "Arabic", time: "09:30 - 10:30", location: "Room 204", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    ],
    monday: [
        { id: "4", subject: "English Literature", time: "07:30 - 08:30", location: "Room 105", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
        { id: "5", subject: "Chemistry", time: "08:30 - 09:30", location: "Lab 2", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    ],
    // ... other days
};

export function SchoolSchedule() {
    const { t } = useTranslation();
    const [selectedDay, setSelectedDay] = useState<string>("sunday"); // Default to Sunday for KSA/MENA

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Weekly Schedule
                </h3>
                <span className="text-xs text-white/40">Fall Semester 2026</span>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap",
                            selectedDay === day
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
                {MOCK_SCHEDULE[selectedDay]?.length ? (
                    MOCK_SCHEDULE[selectedDay].map((session) => (
                        <div
                            key={session.id}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01]",
                                session.color || "bg-white/5 border-white/10"
                            )}
                        >
                            <div className="flex-1">
                                <h4 className="font-bold text-white mb-1">{session.subject}</h4>
                                <div className="flex items-center gap-4 text-xs text-white/60">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 opacity-70" />
                                        {session.time}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 opacity-70" />
                                        {session.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-white/30 text-sm bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                        No classes scheduled
                    </div>
                )}
            </div>
        </div>
    );
}
