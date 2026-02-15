import { useTranslation } from "react-i18next";
import { SchoolSchedule } from "@/components/school/SchoolSchedule";
import { useAuth } from "@/hooks/use-auth";
import { getSchoolConfig } from "@/lib/schoolConfig";
import { COUNTRIES } from "@/lib/countryConfig";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

import { SchoolDashboardSkeleton } from "@/components/school/SchoolDashboardSkeleton";

export default function SchoolDashboard() {
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();
    const [selectedTrack, setSelectedTrack] = useState<"british" | "american">("british");

    if (isLoading) {
        return <SchoolDashboardSkeleton />;
    }

    const handleTrackChange = async (track: "british" | "american") => {
        await Haptics.impact({ style: ImpactStyle.Light });
        setSelectedTrack(track);
    };

    const schoolConfig = getSchoolConfig(user?.schoolId || "alhussan_jubail"); // Fallback for demo
    // @ts-ignore
    const countryConfig = user?.country && user?.enableCountryTheme ? COUNTRIES[user.country] : null;

    if (!schoolConfig) {
        return <div className="p-8 text-center text-white/50">School configuration not found. Please contact support.</div>;
    }

    return (
        <div className="min-h-full p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 p-8"
                style={{
                    background: countryConfig?.theme.flagGradient
                        ? `linear-gradient(to bottom right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), ${countryConfig.theme.flagGradient}`
                        : undefined
                }}
            >
                {/* Flag Watermark (Faint) */}
                {countryConfig && (
                    <div className="absolute top-0 right-0 text-[150px] opacity-[0.03] select-none pointer-events-none transform translate-x-10 -translate-y-10 rotate-12 grayscale">
                        {countryConfig.flag}
                    </div>
                )}

                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                            {/* Use school logo if available, else fallback icon */}
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{schoolConfig.name}</h1>
                            <p className="text-white/60 flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Wait (Week A) Currently Active
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-white/10">
                            <BookOpen className="h-4 w-4" />
                            Access Portal
                        </button>
                        <button className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2 text-sm border border-white/10">
                            Check Grades <ArrowRight className="h-4 w-4 opacity-50" />
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Track Selector & Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    {/* Track Selection */}
                    <div className="bg-[#0A0A0B]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Your Curriculum Track</h3>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => handleTrackChange("british")}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all text-start",
                                        selectedTrack === "british" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    British (IGCSE)
                                </button>
                                <button
                                    onClick={() => handleTrackChange("american")}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all text-start",
                                        selectedTrack === "american" ? "bg-secondary text-white shadow-lg" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    American (SAT)
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 mb-4">
                            {selectedTrack === "british"
                                ? "Current Focus: Cambridge IGCSE & A-Level preparation. Priority on past papers and mark schemes."
                                : "Current Focus: SAT Prep & Common Core alignment. Priority on critical thinking and problem solving."}
                        </p>
                    </div>

                    <div className="bg-[#0A0A0B]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <SchoolSchedule />
                    </div>
                </motion.div>

                {/* Quick Actions / News */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Daily Quote / Value */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">School Value</h3>
                        <p className="text-xl font-medium text-white italic">"Excellence is not a skill, it's an attitude."</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/60">Leadership</span>
                            <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/60">Integrity</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
