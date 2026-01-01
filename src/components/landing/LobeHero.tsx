import { motion } from "framer-motion";
import { Button } from '@lobehub/ui';
import { Typewriter } from "@/components/ui/typewriter";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export const LobeHero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-6 perspective-1000">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-5xl mx-auto"
            >
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white leading-[0.9]">
                    Build Your <br className="hidden md:block" />
                    <Typewriter
                        text={[
                            "Dreams",
                            "Future",
                            "Vision",
                            "Reality",
                            "Legacy"
                        ]}
                        speed={70}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500"
                        waitTime={1500}
                        deleteSpeed={40}
                        cursorChar={"_"}
                    />
                </h1>
                <p className="text-xl md:text-3xl text-white/60 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                    AI-powered creativity for the next generation. <br />
                    <span className="text-white/40">Limitless. Boundless. Yours.</span>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button
                        size="large"
                        type="primary"
                        onClick={() => navigate("/app")}
                        style={{ minWidth: 200, height: 60, fontSize: 20, borderRadius: 999 }}
                    >
                        Get Started Free
                        <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                    <Button
                        size="large"
                        onClick={() => navigate("/pricing")}
                        style={{ minWidth: 200, height: 60, fontSize: 20, borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        View Pricing
                    </Button>
                </div>
            </motion.div>
        </section>
    );
}
