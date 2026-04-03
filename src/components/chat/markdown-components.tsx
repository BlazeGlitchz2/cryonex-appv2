import React, { useState, useEffect } from "react";
import {
  Check,
  Copy,
  Download,
  Maximize2,
  X,
  ChevronRight,
  Info,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  Quote,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import mermaid from "mermaid";

// Initialize mermaid
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "inherit",
  });
}

export const PremiumCodeBlock = ({
  language,
  children,
}: {
  language: string;
  children: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = children.split("\n");
  const isLong = lines.length > 8;

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([children], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayedContent = isLong && !expanded 
    ? lines.slice(0, 6).join("\n") + "\n..." 
    : children;

  return (
    <div className="relative my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-md group shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent opacity-50 pointer-events-none" />
      <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 text-xs text-slate-400 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <span className="font-mono font-medium text-cyan-400/80 ml-2">
            {language || "text"}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-white/10 hover:text-cyan-400 transition-colors"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-white/10 hover:text-cyan-400 transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>
      </div>
      <div className="relative z-10">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.6",
          }}
          wrapLines={true}
          wrapLongLines={true}
          showLineNumbers={!expanded && isLong ? false : true}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#4b5563",
            textAlign: "right",
            userSelect: "none",
          }}
        >
          {displayedContent}
        </SyntaxHighlighter>
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="relative z-10 w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400/60 transition-all hover:text-cyan-300 hover:bg-white/5 border-t border-white/5"
        >
          {expanded ? (
            <>
              <X className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3" />
              Show 0{lines.length - 6} more lines
            </>
          )}
        </button>
      )}
    </div>
  );
};

export const PremiumImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative my-2 group cursor-zoom-in overflow-hidden rounded-xl inline-block"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
          style={{ maxHeight: "400px", objectFit: "contain" }}
          loading="lazy"
          onError={(e) => {
            console.error("Image load failed:", src);
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement?.insertAdjacentHTML(
              "beforeend",
              `<div class="p-4 text-red-400 text-xs">Failed to load image: ${src}</div>`,
            );
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white">
          <Maximize2 className="w-4 h-4" />
        </div>
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-xl">
            <p className="text-xs text-white/90 truncate">{alt}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
            onClick={() => setIsOpen(false)}
          >
            {/* Top Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-[60] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
              <div className="flex flex-col gap-1 pointer-events-auto">
                {alt && (
                  <h3 className="text-white font-medium text-sm md:text-base drop-shadow-md">
                    {alt}
                  </h3>
                )}
                <span className="text-cyan-400/80 text-[10px] font-mono tracking-wider drop-shadow-md flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  CRYONEX IMAGE ENGINE
                </span>
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement("a");
                    a.href = src || "";
                    a.download = `cryonex-image-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 group/btn"
                  title="Download image"
                >
                  <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 group/btn"
                  title="Close viewer"
                >
                  <X className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group max-w-full max-h-full flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  className="max-w-[90vw] max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 select-none ring-1 ring-white/20"
                />
                {/* Subtle inner glow effect */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none" />
              </div>
            </motion.div>

            {/* Bottom Navigation / Hint */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-md mt-4"
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
              </div>
              Click backdrop to exit
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

import { LinkPreview } from "@/components/ui/link-preview";

export const PremiumLink = ({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) => {
  if (!href) return <span>{children}</span>;

  return (
    <LinkPreview
      url={href}
      className="inline-flex items-center gap-0.5 font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 transition-all border-b border-cyan-500/30 hover:border-cyan-400/80 pb-0.5 decoration-0"
    >
      {children}
      <span className="text-xs text-cyan-500/50">↗</span>
    </LinkPreview>
  );
};

export const PremiumBlockquote = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative my-8 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-xl overflow-hidden group">
      <div className="absolute top-4 left-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <Quote className="w-12 h-12 text-cyan-400 rotate-180" />
      </div>
      <blockquote className="relative z-10 pl-8 italic text-lg text-slate-200 leading-relaxed font-serif border-l-2 border-cyan-500/30">
        {children}
      </blockquote>
      <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <Quote className="w-8 h-8 text-purple-400" />
      </div>
    </div>
  );
};

export const PremiumTable = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  </div>
);

export const PremiumThead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-white/5 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-white/10">
    {children}
  </thead>
);

export const PremiumTh = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 whitespace-nowrap">{children}</th>
);

export const PremiumTd = ({ children }: { children: React.ReactNode }) => (
  <td className="px-6 py-4 border-b border-white/5 last:border-0 text-slate-300">
    {children}
  </td>
);

export const PremiumCallout = ({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "danger" | "tip";
  children: React.ReactNode;
}) => {
  const styles = {
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      icon: Info,
      color: "text-blue-400",
    },
    warning: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/10",
      icon: AlertTriangle,
      color: "text-yellow-400",
    },
    danger: {
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      icon: AlertOctagon,
      color: "text-red-400",
    },
    tip: {
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      icon: Lightbulb,
      color: "text-green-400",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4",
        style.border,
        style.bg,
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.color)} />
      <div className="text-sm text-slate-200 [&>p]:m-0">{children}</div>
    </div>
  );
};

export const PremiumImageGallery = ({
  images,
}: {
  images: { src: string; alt?: string }[];
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-4 my-6",
        images.length === 1
          ? "grid-cols-1"
          : images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 md:grid-cols-3",
      )}
    >
      {images.map((img, idx) => (
        <PremiumImage key={idx} src={img.src} alt={img.alt} />
      ))}
    </div>
  );
};

export const PremiumMermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const id = React.useId().replace(/:/g, "");

  useEffect(() => {
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        setSvg(svg);
        setError(false);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError(true);
      }
    };

    renderChart();
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400 text-sm font-mono">
        Failed to render diagram
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 bg-white/5 rounded-lg border border-white/10 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
