import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("consent.choice.v1");
      if (!saved) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openConsentBanner", handler as EventListener);
    (window as any).openConsentBanner = () => setOpen(true);
    return () => window.removeEventListener("openConsentBanner", handler as EventListener);
  }, []);

  const updateConsent = (granted: boolean) => {
    const status = granted ? "granted" : "denied";
    try {
      localStorage.setItem("consent.choice.v1", granted ? "accepted" : "denied");
    } catch { }
    if ((window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
        analytics_storage: status,
      });
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl text-white p-6 shadow-2xl shadow-purple-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-white/70 leading-relaxed">
            We use cookies to deliver and measure personalized ads (Google AdSense) and improve the product.
            See our <a href="/privacy" className="underline hover:text-white decoration-purple-400 underline-offset-4">Privacy Policy</a>.
            You can change your choice anytime in “Cookie settings”.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={() => updateConsent(false)} className="border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white">
              Decline
            </Button>
            <Button size="sm" onClick={() => updateConsent(true)} className="bg-white text-black hover:bg-white/90 font-medium">
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
