import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

type Logo = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
    logos: Logo[];
};

export function LogoCloud({ logos }: LogoCloudProps) {
    return (
        <div className="relative mx-auto max-w-3xl bg-transparent py-6 md:border-x border-white/5">
            <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-white/5" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />
            <InfiniteSlider gap={42} reverse duration={60} durationOnHover={20}>
                {logos.map((logo) => (
                    <img
                        alt={logo.alt}
                        className="pointer-events-none h-6 select-none md:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 relative z-10"
                        height="auto"
                        key={`logo-${logo.alt}`}
                        loading="lazy"
                        src={logo.src}
                        width="auto"
                    />
                ))}
            </InfiniteSlider>

            <ProgressiveBlur
                blurIntensity={1}
                className="pointer-events-none absolute top-0 left-0 h-full w-[160px]"
                direction="left"
            />
            <ProgressiveBlur
                blurIntensity={1}
                className="pointer-events-none absolute top-0 right-0 h-full w-[160px]"
                direction="right"
            />

            <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-white/5" />
        </div>
    );
}
