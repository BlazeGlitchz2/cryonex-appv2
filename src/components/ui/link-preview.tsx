"use client";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import React, { useState, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  isStatic?: boolean;
  imageSrc?: string;
};

type PreviewData = {
  title?: string;
  description?: string;
  image?: { url: string };
  logo?: { url: string };
  publisher?: string;
};

export const LinkPreview = ({
  children,
  url,
  className,
  width = 320,
  height = 200,
  quality = 50,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  const [isOpen, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && !data && !loading && !hasError && !isStatic) {
      setLoading(true);
      fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.status === "success") {
            setData(json.data);
          } else {
            setHasError(true);
          }
        })
        .catch(() => setHasError(true))
        .finally(() => setLoading(false));
    }
  }, [isOpen, url, data, loading, hasError, isStatic]);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2; // Reduce the effect to make it subtle
    x.set(offsetFromCenter);
  };

  const domain = new URL(url).hostname.replace("www.", "");
  const displayImage = isStatic ? imageSrc : data?.image?.url;
  const displayTitle = data?.title || domain;
  const displayDesc = data?.description;
  const displayLogo = data?.logo?.url;
  const displayPublisher = data?.publisher || domain;

  return (
    <>
      {isMounted ? (
        <div className="hidden">
          <img src={displayImage} width={width} height={height} alt="preload" />
        </div>
      ) : null}
      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn(
            "text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30 hover:decoration-cyan-300/60 transition-all font-medium cursor-pointer",
            className,
          )}
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
          side="top"
          align="center"
          sideOffset={10}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="shadow-2xl rounded-xl bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/10 overflow-hidden"
                style={{
                  x: translateX,
                }}
              >
                <div className="relative z-50 w-[360px]">
                  {" "}
                  {/* Increased width for "huge" feel */}
                  {loading ? (
                    <div className="flex items-center justify-center h-48 text-white/50 gap-2 bg-white/5">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-xs uppercase tracking-widest">
                        Loading preview...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* Large Image Preview */}
                      {displayImage ? (
                        <div className="relative h-52 w-full overflow-hidden bg-black/50 group">
                          <img
                            src={displayImage}
                            alt={displayTitle}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80" />

                          {/* Logo Overlay */}
                          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                            {displayLogo ? (
                              <img
                                src={displayLogo}
                                alt=""
                                className="h-3 w-3 rounded-full"
                              />
                            ) : (
                              <Globe className="h-3 w-3 text-white/70" />
                            )}
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
                              {displayPublisher}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center border-b border-white/5">
                          <Globe className="w-8 h-8 text-white/10" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5 space-y-3 relative bg-gradient-to-b from-[#0A0A0B] to-[#0A0A0B]/95">
                        <h4 className="text-base font-bold text-white leading-tight line-clamp-2">
                          {displayTitle}
                        </h4>

                        {displayDesc && (
                          <p className="text-xs text-white/60 line-clamp-3 leading-relaxed font-medium">
                            {displayDesc}
                          </p>
                        )}

                        <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-white/30 truncate max-w-[200px] font-mono">
                            {domain}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                            Visit Source
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};
