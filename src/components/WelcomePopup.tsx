import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export function WelcomePopup() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const hasSeen = sessionStorage.getItem("hasSeenWelcome");
        if (!hasSeen) {
            setOpen(true);
            // Fire confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults, 
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults, 
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            sessionStorage.setItem("hasSeenWelcome", "true");
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-6 pt-4">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <img src="/logo.png" alt="Cryonex" className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-3xl font-bold tracking-tight">Welcome to Cryonex</DialogTitle>
                        <DialogDescription className="text-primary font-mono uppercase tracking-widest text-xs font-bold">
                            Test Release v0.9.0
                        </DialogDescription>
                    </div>
                </DialogHeader>
                
                <div className="text-center space-y-6 py-6 px-4">
                    <p className="text-white/70 leading-relaxed">
                        You are experiencing an early preview of Cryonex. We're constantly improving and adding new features.
                    </p>
                    
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Report Issues & Feedback</p>
                        <a 
                            href="https://instagram.com/cryonex.ai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-primary transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            @cryonex.ai
                        </a>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center pb-2">
                    <Button 
                        onClick={() => setOpen(false)} 
                        className="w-full sm:w-auto min-w-[200px] h-12 text-base font-semibold bg-white text-black hover:bg-white/90 rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                        Start Creating
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
