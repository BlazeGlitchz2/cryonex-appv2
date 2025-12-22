import React, { useState, useEffect } from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ExternalLink, Loader2, Globe } from "lucide-react";

interface LinkPreviewProps {
    url: string;
    children: React.ReactNode;
}

interface PreviewData {
    title?: string;
    description?: string;
    image?: { url: string };
    logo?: { url: string };
    publisher?: string;
}

export function LinkPreview({ url, children }: LinkPreviewProps) {
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (isOpen && !data && !loading && !hasError) {
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
    }, [isOpen, url, data, loading, hasError]);

    const domain = new URL(url).hostname.replace("www.", "");

    return (
        <HoverCard openDelay={300} onOpenChange={setIsOpen}>
            <HoverCardTrigger asChild>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors cursor-pointer"
                >
                    {children}
                </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 overflow-hidden bg-[#0A0A0B]/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl">
                {loading ? (
                    <div className="flex items-center justify-center h-32 text-white/50 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Loading preview...</span>
                    </div>
                ) : data ? (
                    <div className="flex flex-col">
                        {/* Image Preview */}
                        {data.image?.url && (
                            <div className="relative h-40 w-full overflow-hidden bg-black/50">
                                <img
                                    src={data.image.url}
                                    alt={data.title || "Preview"}
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent opacity-60" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-4 space-y-2 relative">
                            <div className="flex items-center gap-2 mb-1">
                                {data.logo?.url ? (
                                    <img src={data.logo.url} alt="" className="h-4 w-4 rounded-full" />
                                ) : (
                                    <Globe className="h-3 w-3 text-white/50" />
                                )}
                                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                                    {data.publisher || domain}
                                </span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                                {data.title || domain}
                            </h4>

                            {data.description && (
                                <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                                    {data.description}
                                </p>
                            )}

                            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-white/30 truncate max-w-[150px]">{domain}</span>
                                <ExternalLink className="h-3 w-3 text-white/30" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center">
                        <p className="text-xs text-white/50">Preview unavailable</p>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}
