import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function SpaceBackground() {
    const [init, setInit] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check for mobile/tablet
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
        }

        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    // Drastically reduce particle count on mobile
    const particleCount = isMobile ? 20 : 80;

    return (
        <Particles
            id="tsparticles"
            className="absolute inset-0 z-0 pointer-events-none"
            options={{
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 60, // Cap FPS for battery/performance
                interactivity: {
                    events: {
                        onClick: {
                            enable: !isMobile, // Disable interaction on mobile
                            mode: "push",
                        },
                        onHover: {
                            enable: !isMobile, // Disable hover on mobile
                            mode: "repulse",
                        },
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 100,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: "#ffffff",
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.1,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: true,
                        speed: isMobile ? 0.5 : 1, // Slower movement on mobile
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                        },
                        value: particleCount,
                    },
                    opacity: {
                        value: 0.3,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
        />
    );
}