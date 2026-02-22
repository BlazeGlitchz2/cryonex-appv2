import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface PDFViewerProps {
  storageId?: string;
  title: string;
  numPages?: number;
}

export function PDFViewer({ storageId, title, numPages = 100 }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Phase 6: Strict PDF Citation Jump Listener
  useEffect(() => {
    const handleCitationClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ page: number; paragraph: number | null }>;
      const { page, paragraph } = customEvent.detail;

      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
        toast.info(`Jumping to Page ${page}${paragraph ? `, Paragraph ${paragraph}` : ''} 📄`, {
          icon: '📍'
        });
      } else {
        toast.error(`Citation claims Page ${page}, but document lacks it.`);
      }
    };

    window.addEventListener('cryonex-citation-click', handleCitationClick);
    return () => window.removeEventListener('cryonex-citation-click', handleCitationClick);
  }, [numPages]);

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] h-full flex flex-col">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white">
            Page {currentPage} of {numPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage === numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-[#6b6b6b] mb-2">PDF Preview</p>
          <p className="text-sm text-[#6b6b6b]">{title}</p>
          <p className="text-xs text-[#6b6b6b] mt-4">
            Full PDF rendering requires additional setup
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
