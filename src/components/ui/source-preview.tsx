"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe, FileText } from "lucide-react";

export interface SourceData {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  image?: string;
}

const SourcePreviewContext = createContext<{
  handleHoverStart: (data: SourceData, e: React.MouseEvent) => void;
  handleHoverMove: (e: React.MouseEvent) => void;
  handleHoverEnd: () => void;
  preFetch: (sources: SourceData[]) => void;
} | null>(null);

const metadataCache: Record<string, any> = {};

export const SourcePreviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeSource, setActiveSource] = useState<SourceData | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    const cardWidth = 320;
    const cardHeight = 240;
    const offsetY = 10; // Reduced offset to bring it closer

    let x = e.clientX - cardWidth / 2;
    let y = e.clientY - cardHeight - offsetY;

    if (x + cardWidth > window.innerWidth - 20)
      x = window.innerWidth - cardWidth - 20;
    if (x < 20) x = 20;
    if (y < 20) y = e.clientY + offsetY + 20; // If it flips to bottom, add some space

    setPosition({ x, y });
  }, []);

  const fetchMetadata = useCallback(async (url: string) => {
    if (metadataCache[url]) return metadataCache[url];

    try {
      const res = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`,
      );
      const json = await res.json();
      if (json.status === "success") {
        metadataCache[url] = json.data;
        return json.data;
      }
    } catch (err) {
      console.error("Metadata fetch error:", err);
    }
    return null;
  }, []);

  const preFetch = useCallback(
    (sources: SourceData[]) => {
      sources.forEach((source) => {
        if (!metadataCache[source.url]) {
          fetchMetadata(source.url);
        }
      });
    },
    [fetchMetadata],
  );

  useEffect(() => {
    if (isVisible && activeSource) {
      const cached = metadataCache[activeSource.url];
      if (cached) {
        setMetadata(cached);
        setLoading(false);
      } else {
        setLoading(true);
        fetchMetadata(activeSource.url).then((data) => {
          if (activeSource.url === activeSource.url) {
            // Check if still active
            setMetadata(data);
            setLoading(false);
          }
        });
      }
    }
  }, [isVisible, activeSource, fetchMetadata]);

  const handleHoverStart = useCallback(
    (data: SourceData, e: React.MouseEvent) => {
      setActiveSource(data);
      const cached = metadataCache[data.url];
      setMetadata(cached || null);
      setIsVisible(true);
      updatePosition(e);
    },
    [updatePosition],
  );

  const handleHoverMove = useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) updatePosition(e);
    },
    [isVisible, updatePosition],
  );

  const handleHoverEnd = useCallback(() => {
    setIsVisible(false);
  }, []);

  const displayTitle = metadata?.title || activeSource?.title;
  const displaySnippet = metadata?.description || activeSource?.snippet;
  const displayImage = metadata?.image?.url || activeSource?.image;
  const displayLogo = metadata?.logo?.url;
  const displayPublisher = metadata?.publisher || activeSource?.domain;

  return (
    <SourcePreviewContext.Provider
      value={{ handleHoverStart, handleHoverMove, handleHoverEnd, preFetch }}
    >
      {children}
      <AnimatePresence>
        {isVisible && activeSource && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="fixed pointer-events-none z-[9999]"
            style={{ left: position.x, top: position.y, width: 320 }}
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
              {loading && !metadata ? (
                <div className="h-32 w-full flex flex-col items-center justify-center gap-3 bg-white/5">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                    Fetching Preview
                  </span>
                </div>
              ) : (
                <>
                  {displayImage ? (
                    <div className="h-40 w-full overflow-hidden border-b border-white/5 relative">
                      <img
                        src={displayImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-24 w-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center border-b border-white/5">
                      <Globe className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {displayLogo ? (
                        <img
                          src={displayLogo}
                          alt=""
                          className="w-4 h-4 rounded-sm"
                        />
                      ) : (
                        <div className="p-1 rounded-md bg-white/5 border border-white/10">
                          <Globe className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                        {displayPublisher}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-bold text-white line-clamp-2 leading-tight tracking-tight">
                      {displayTitle}
                    </h4>
                    {displaySnippet && (
                      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed font-medium">
                        {displaySnippet}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-wider">
                        <ExternalLink className="w-3 h-3" />
                        Visit Source
                      </div>
                      <span className="text-[10px] text-white/20 font-mono">
                        {activeSource.domain}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SourcePreviewContext.Provider>
  );
};

export const SourceLink = ({
  source,
  children,
  className,
}: {
  source: SourceData;
  children: React.ReactNode;
  className?: string;
}) => {
  const context = useContext(SourcePreviewContext);
  if (!context)
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onMouseEnter={(e) => context.handleHoverStart(source, e)}
      onMouseMove={context.handleHoverMove}
      onMouseLeave={context.handleHoverEnd}
    >
      {children}
    </a>
  );
};

export const useSourcePreview = () => {
  const context = useContext(SourcePreviewContext);
  if (!context)
    throw new Error(
      "useSourcePreview must be used within SourcePreviewProvider",
    );
  return context;
};
