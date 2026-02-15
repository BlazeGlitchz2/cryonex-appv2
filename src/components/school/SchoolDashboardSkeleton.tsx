import { motion } from "framer-motion";

export function SchoolDashboardSkeleton() {
    return (
        <div className="min-h-full p-6 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/5 p-8 h-[240px]">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/10" />
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-white/10 rounded-lg" />
                        <div className="h-4 w-48 bg-white/5 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <div className="h-10 w-32 bg-white/10 rounded-xl" />
                    <div className="h-10 w-32 bg-white/5 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule & Track Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Track Selector Skeleton */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[140px]">
                        <div className="flex justify-between mb-4">
                            <div className="h-6 w-40 bg-white/10 rounded-lg" />
                            <div className="h-8 w-60 bg-white/10 rounded-xl" />
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-lg" />
                    </div>

                    {/* Schedule Skeleton */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[300px]">
                        <div className="flex justify-between mb-6">
                            <div className="h-6 w-32 bg-white/10 rounded-lg" />
                            <div className="h-4 w-24 bg-white/5 rounded-lg" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 w-full bg-white/5 rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar / News Skeleton */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[180px]" />
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[200px]" />
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[160px]" />
                </div>
            </div>
        </div>
    );
}
