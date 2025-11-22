import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type GlassNavProps = {
  title: string;
  actions: Array<React.ReactNode>;
  onMenuToggle?: () => void;
};

export function GlassNav({ title, actions, onMenuToggle }: GlassNavProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "sticky top-0 z-50 px-3 pt-2" : "sticky top-0 z-50 px-4 pt-3"}>
      <div
        className={`rounded-2xl flex items-center justify-between text-white bg-white/10 backdrop-blur-md backdrop-saturate-150 border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.35)] ${
          isMobile ? "h-14 px-3" : "h-12 px-3 sm:px-4"
        }`}
        role="navigation"
        aria-label="Top Navigation"
      >
        <div className={isMobile ? "font-bold text-lg tracking-tight" : "font-semibold tracking-tight"}>{title}</div>

        <div className="hidden md:flex items-center gap-2">
          {actions.map((node, i) => (
            <div key={i} className="flex items-center">{node}</div>
          ))}
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={(v) => { setOpen(v); onMenuToggle?.(); }}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-80 bg-[#121212] text-white border-white/10 bg-white/10 backdrop-blur-md backdrop-saturate-150 border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
              <div className="mt-10 space-y-3" role="menu" aria-label="Mobile navigation">
                {actions.map((node, i) => (
                  <div key={i} className="flex items-center">{node}</div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export default GlassNav;