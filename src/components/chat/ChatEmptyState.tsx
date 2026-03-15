import React from 'react';
import {
    IconImage,
    IconFile,
    IconData,
    IconBrain
} from '@/components/ui/icons/Web3Icons';

const FeatureCards = React.memo(({ onSend }: { onSend: (text: string) => void }) => {
    const features = [
        {
            icon: IconImage,
            label: "Generate Images",
            desc: "Create Visuals",
            gradient: "from-purple-500 to-fuchsia-500",
            bgGradient: "from-purple-500/20 to-fuchsia-500/20",
            border: "border-purple-500/30",
            prompt: "generate a image of a golden robot",
        },
        {
            icon: IconFile,
            label: "Write Content",
            desc: "AI Writing",
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/20 to-cyan-500/20",
            border: "border-blue-500/30",
        },
        {
            icon: IconData,
            label: "Write Code",
            desc: "Development",
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-500/20 to-teal-500/20",
            border: "border-emerald-500/30",
        },
        {
            icon: IconBrain,
            label: "Brainstorm",
            desc: "Ideation",
            gradient: "from-orange-500 to-amber-500",
            bgGradient: "from-orange-500/20 to-amber-500/20",
            border: "border-orange-500/30",
        },
    ];

    return (
        <>
            <div className="md:hidden w-full overflow-visible -mx-4 px-4">
                <div className="mobile-scroll-x pb-2">
                    {features.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSend(item.prompt || `Help me ${item.label.toLowerCase()}`)}
                            className={`group relative overflow-hidden rounded-2xl border ${item.border} glass p-4 text-left touch-feedback min-w-[140px] flex-shrink-0`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.bgGradient} flex items-center justify-center`}>
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{item.label}</h3>
                                    <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-4 w-full max-w-2xl">
                {features.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSend(item.prompt || `Help me ${item.label.toLowerCase()}`)}
                        className={`group relative overflow-hidden rounded-[1.5rem] border ${item.border} glass hover:bg-white/[0.1] p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 touch-manipulation`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${item.bgGradient} text-white shadow-inner`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">{item.label}</h3>
                                <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors uppercase tracking-wider">{item.desc}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );
});

export function ChatEmptyState({
    project,
    onSend
}: {
    project: any,
    onSend: (text: string) => void
}) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] py-6 md:py-10 animate-in fade-in duration-700 px-4">
            <div className="space-y-4 md:space-y-6 flex flex-col items-center mb-6 md:mb-10 relative z-10">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />
                    <div className="relative h-20 w-20 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:scale-105 transition-transform duration-500">
                        <img
                            src="/assets/cryonex-logo-official.png"
                            alt="Cryonex Logo"
                            className="h-14 w-14 md:h-20 md:w-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        />
                    </div>
                </div>
                <div className="text-center space-y-2 md:space-y-3">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white tracking-tight mobile-text-hero">
                        {project ? `${project?.name}` : "Hey there!"}
                    </h2>
                    <p className="text-sm md:text-base lg:text-lg text-white/60 font-light max-w-xs md:max-w-md mx-auto">
                        {project ? "Ready for input." : "What would you like to create?"}
                    </p>
                </div>
            </div>
            <FeatureCards onSend={onSend} />
        </div>
    );
}
