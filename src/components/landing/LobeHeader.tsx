import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface LobeHeaderProps {
    onMenuOpen?: () => void;
}

export const LobeHeader = ({ onMenuOpen }: LobeHeaderProps) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "w-full transition-all duration-300 border-b z-50",
                scrolled
                    ? "bg-black/50 backdrop-blur-xl border-white/5 py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate("/")}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/assets/cryonex-logo-official.png"
                            alt="Cryonex Logo"
                            className="h-9 w-9 relative z-10 transition-transform group-hover:scale-110 duration-300"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-50 transition-colors">
                        Cryonex
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/login")}
                        className="text-white/70 hover:text-white hidden md:inline-flex hover:bg-white/5 rounded-full px-6 transition-all"
                    >
                        Sign In
                    </Button>

                    <GradientButton
                        onClick={() => navigate("/app")}
                        className="h-10 min-w-[100px] md:min-w-[120px] px-4 md:px-6 text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                    >
                        Launch App
                    </GradientButton>

                    {/* Mobile Menu Trigger */}
                    {onMenuOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMenuOpen}
                            className="text-white/70 hover:text-white hover:bg-white/5 rounded-full"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};
