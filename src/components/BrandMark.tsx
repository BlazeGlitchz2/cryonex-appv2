import { cn } from "@/lib/utils";

/** Render the official repository asset with consistent clear space. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("cx-brand-mark", className)} aria-hidden="true">
      <img
        src="/assets/cryonex-logo-official.png"
        width="500"
        height="500"
        alt=""
        draggable={false}
      />
    </span>
  );
}
