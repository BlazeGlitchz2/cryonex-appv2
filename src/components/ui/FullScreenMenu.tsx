import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

const menuItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Login", href: "/login" },
];

export function FullScreenMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
                <Menu className="h-6 w-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-[#030010]/95 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400" />
                                <span className="text-xl font-bold tracking-tight text-white">
                                    Cryonex
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-white/10 hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex flex-1 flex-col items-center justify-center gap-8">
                            {menuItems.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <Link
                                        to={item.href}
                                        className="group relative flex items-center gap-4 text-5xl font-bold tracking-tighter text-white/50 transition-colors hover:text-white md:text-7xl"
                                    >
                                        <span>{item.label}</span>
                                        <ArrowRight className="h-8 w-8 -translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:h-12 md:w-12" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-8 text-center">
                            <p className="text-sm text-white/30">
                                © 2024 Cryonex. All rights reserved.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
