import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Crown,
  Check,
  Sparkles,
  Gift,
  ArrowRight,
  X,
  Copy,
  Link,
  Share2,
  Eye,
  Fuel,
  Trophy,
} from "lucide-react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import {
  initializeAdMob,
  prepareRewardedAd,
  showRewardedAd,
  isNativePlatform,
} from "@/services/admobService";

interface RefuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "main" | "study";
}

type RefuelTab = "view" | "refer" | "guide" | "upgrade";

/* ─── Circular countdown ring ─── */
function CountdownRing({
  seconds,
  total,
  size = 88,
}: {
  seconds: number;
  total: number;
  size?: number;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* track */}
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#countdown-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="countdown-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      {/* label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums leading-none">
          {seconds}
        </span>
        <span className="text-[9px] text-white/30 font-medium uppercase tracking-wide mt-0.5">
          sec
        </span>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function RefuelModal({ isOpen, onClose, type }: RefuelModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RefuelTab>("view");
  const [referralCode, setReferralCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ad Viewing State
  const [isViewingAd, setIsViewingAd] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [hasFailed, setHasFailed] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  const redeemReferral = useMutation(api.credits.redeemReferral);
  const claimAdReward = useMutation(api.credits.claimAdReward);
  const getOrCreateCode = useMutation(api.affiliates.getOrCreateCode);
  const affiliateStats = useQuery(api.affiliates.getStats);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize AdMob on mount (for native platforms)
  useEffect(() => {
    if (isNativePlatform()) {
      initializeAdMob().then(() => {
        prepareRewardedAd();
      });
    }
  }, []);

  // Load user's referral code when refer tab is opened
  useEffect(() => {
    if (
      activeTab === "refer" &&
      !myCode &&
      !isGenerating &&
      !hasFailed &&
      isAuthenticated
    ) {
      setIsGenerating(true);
      getOrCreateCode({})
        .then((result) => {
          setMyCode(result.code);
        })
        .catch((err) => {
          console.error("Failed to get referral code:", err);
          setHasFailed(true);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [
    activeTab,
    myCode,
    isGenerating,
    getOrCreateCode,
    hasFailed,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (affiliateStats?.code && !myCode) {
      setMyCode(affiliateStats.code);
    }
  }, [affiliateStats, myCode]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("view");
    }
  }, [isOpen, type]);

  const adRewardType: "main" | "study" = type;
  const adRewardAmount = type === "study" ? 10 : 5;
  const rewardUnit = "Cryo Credits";
  const rewardDescription =
    type === "study"
      ? "for your next PDF upload or study session."
      : "for image, video, and premium media usage.";

  const referralLink = myCode
    ? `${window.location.origin}/login?ref=${myCode}`
    : "";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Cryonex AI",
          text: "Use my referral link to get 10 bonus credits!",
          url: referralLink,
        });
      } catch {
        copyToClipboard(referralLink);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const handleViewAd = async () => {
    if (isNativePlatform()) {
      setAdLoading(true);
      try {
        await prepareRewardedAd();
        const result = await showRewardedAd();
        if (result.success && result.rewarded) {
          await claimAdReward({ creditType: adRewardType });
          toast.success(`🎉 You earned ${adRewardAmount} ${rewardUnit}!`);
          onClose();
        } else if (!result.success) {
          toast.error(result.error || "Failed to load ad. Please try again.");
        } else {
          toast.info(`Watch the full ad to earn ${rewardUnit}!`);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to show ad");
      } finally {
        setAdLoading(false);
        prepareRewardedAd();
      }
    } else {
      setIsViewingAd(true);
      setCountdown(15);
      setCanClaim(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleClaimReward = async () => {
    if (!canClaim) return;
    setIsWatching(true);
    try {
      await claimAdReward({ creditType: adRewardType });
      toast.success(`🎉 You earned ${adRewardAmount} ${rewardUnit}!`);
      setIsViewingAd(false);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to reward credits");
    } finally {
      setIsWatching(false);
    }
  };

  const handleRedeemReferral = async () => {
    if (!referralCode.trim()) return;
    setIsRedeeming(true);
    try {
      const result = await redeemReferral({ referralCode });
      toast.success(result.message);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Invalid code");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleUpgrade = () => {
    onClose();
    navigate("/plans#pricing");
  };

  const handleStudyRefillGuide = () => {
    setActiveTab("view");
  };

  const tabs =
    type === "study"
      ? [
          {
            id: "view" as const,
            label: "Watch",
            icon: Eye,
            badge: `+${adRewardAmount}`,
          },
          {
            id: "guide" as const,
            label: "Guide",
            icon: Trophy,
            badge: "How",
          },
          { id: "upgrade" as const, label: "Plans", icon: Crown, badge: "New" },
        ]
      : [
          {
            id: "view" as const,
            label: "Watch",
            icon: Eye,
            badge: `+${adRewardAmount}`,
          },
          { id: "refer" as const, label: "Refer", icon: Gift, badge: "+10" },
          { id: "upgrade" as const, label: "Plans", icon: Crown, badge: "New" },
        ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsViewingAd(false);
          setIsWatching(false);
        }
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-[440px] p-0 bg-[#09090b] border border-white/[0.08] overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        {/* ─── Glow accents ─── */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/[0.04] blur-3xl" />

        <div className="relative">
          {/* ─── Header ─── */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              {/* Fuel icon */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/10">
                  <Fuel className="w-5 h-5 text-cyan-400" />
                </div>
                {/* Glow pulse */}
                <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-md animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  Refuel Station
                </h2>
                <p className="text-[11px] text-white/35 font-medium">
                  {type === "study"
                    ? "Refill your study flow"
                    : "Refill your Cryo Credits"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
          </div>

          {/* ─── Tab navigation ─── */}
          {!isViewingAd && (
            <div className="px-6 pb-5">
              <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200",
                        active
                          ? "bg-white/[0.07] text-white shadow-sm"
                          : "text-white/35 hover:text-white/55 hover:bg-white/[0.03]",
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          active ? "text-cyan-400" : "text-current",
                        )}
                      />
                      <span>{tab.label}</span>
                      {/* reward badge */}
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none",
                          active
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "bg-white/[0.04] text-white/25",
                        )}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Tab content ─── */}
          <div className="px-6 pb-6">
            {/* ═══════ VIEW AD ═══════ */}
            {activeTab === "view" && (
              <div className="animate-in fade-in duration-200">
                {!isViewingAd ? (
                  <div className="flex flex-col items-center">
                    {/* Energy orb */}
                    <div className="relative mb-5">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent flex items-center justify-center border border-cyan-500/10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/15 flex items-center justify-center border border-cyan-500/10">
                          <Zap className="w-7 h-7 text-cyan-400" />
                        </div>
                      </div>
                      {/* Floating particles */}
                      <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-ping" />
                      <div
                        className="absolute bottom-3 left-1 w-1 h-1 rounded-full bg-blue-400/30 animate-ping"
                        style={{ animationDelay: "0.5s" }}
                      />
                    </div>

                    {/* Reward info */}
                    <h3 className="text-sm font-bold text-white mb-1">
                      View & Earn
                    </h3>
                    <p className="text-[13px] text-white/35 text-center max-w-[220px] leading-relaxed mb-6">
                      Watch a short ad and earn{" "}
                      <span className="text-cyan-400 font-semibold">
                        +{adRewardAmount} {rewardUnit}
                      </span>{" "}
                      {rewardDescription}
                    </p>

                    {/* CTA */}
                    <Button
                      size="lg"
                      onClick={handleViewAd}
                      disabled={adLoading}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold text-sm border-0",
                        "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
                        "hover:from-cyan-400 hover:to-blue-400",
                        "shadow-lg shadow-cyan-500/10",
                        "transition-all duration-300 active:scale-[0.98]",
                      )}
                    >
                      {adLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {isNativePlatform() ? "Watch Ad Now" : "View Ad Now"}
                        </span>
                      )}
                    </Button>

                    {/* Info note */}
                    <p className="text-[10px] text-white/20 mt-3 text-center">
                      {type === "study"
                        ? "15-second view • enough for one more PDF upload"
                        : "15-second view • credits added instantly"}
                    </p>
                  </div>
                ) : (
                  /* ─── AD VIEWING STATE ─── */
                  <div className="flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Countdown + status */}
                    <div className="flex flex-col items-center mb-4">
                      <CountdownRing seconds={countdown} total={15} />
                      <p className="text-[11px] text-white/30 mt-2.5 font-medium">
                        {canClaim
                          ? "Ad complete — claim your reward!"
                          : "Viewing sponsored content..."}
                      </p>
                    </div>

                    {/* Ad container */}
                    <div className="relative bg-[#0c0c0f] rounded-xl border border-white/[0.06] overflow-hidden mb-4">
                      {/* Sponsored label */}
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-pulse" />
                        <span className="text-[9px] font-medium text-white/25 uppercase tracking-widest">
                          Sponsored
                        </span>
                      </div>

                      {/* Iframe */}
                      <div className="relative w-full" style={{ height: 320 }}>
                        <iframe
                          src="https://otieu.com/4/10494221"
                          className="w-full h-full border-none"
                          title="Advertisement"
                        />
                      </div>
                    </div>

                    {/* Reward preview */}
                    <div className="flex items-center justify-center gap-2 mb-4 py-2 px-3 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
                      <span className="text-xs text-white/40 font-medium">
                        You'll earn{" "}
                        <span className="text-cyan-400 font-bold">
                          +{adRewardAmount} {rewardUnit}
                        </span>
                      </span>
                    </div>

                    {/* Claim button */}
                    <Button
                      size="lg"
                      onClick={handleClaimReward}
                      disabled={!canClaim || isWatching}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold text-sm transition-all duration-300",
                        canClaim
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                          : "bg-white/[0.04] text-white/25 border border-white/[0.06] cursor-not-allowed",
                      )}
                    >
                      {isWatching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canClaim ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Claim +{adRewardAmount} Cryo Credits
                        </span>
                      ) : (
                        <span className="tabular-nums">
                          Wait {countdown}s to claim...
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "guide" && type === "study" && (
              <div className="animate-in fade-in duration-200">
                <div className="relative p-5 rounded-xl overflow-hidden border border-emerald-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-[#09090b] to-cyan-900/10" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                        <Trophy className="w-5.5 h-5.5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                          How Cryo Credits work
                        </h3>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Your fastest path back to another PDF upload
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {[
                        "Cryo Credits now power both study uploads and premium media",
                        "Each PDF extraction uses 10 Cryo Credits",
                        "Watching one ad here gives +10 Cryo Credits",
                        "Plans expand your Cryo balance if you need more",
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-xs text-white/50 font-medium">
                            {text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={handleStudyRefillGuide}
                      className={cn(
                        "w-full h-11 rounded-xl font-bold text-sm border-0",
                        "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white",
                        "hover:from-emerald-400 hover:to-cyan-400",
                        "shadow-lg shadow-emerald-500/10",
                        "transition-all duration-300 active:scale-[0.98]",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        Refill 10 now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ REFER ═══════ */}
            {activeTab === "refer" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Share & earn header */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/[0.06] to-blue-500/[0.04] border border-cyan-500/[0.08]">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-4.5 h-4.5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">
                      Share & Earn
                    </p>
                    <p className="text-[10px] text-white/35">
                      Both you and your friend get{" "}
                      <span className="text-cyan-400 font-bold">
                        +10 credits
                      </span>
                    </p>
                  </div>
                  {affiliateStats && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/15 font-bold tabular-nums shrink-0">
                      {affiliateStats.signups || 0}
                    </span>
                  )}
                </div>

                {/* Referral link */}
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <Link className="w-3 h-3 text-white/25" />
                    <span className="text-[10px] font-medium text-white/35 uppercase tracking-wider">
                      Your link
                    </span>
                  </label>

                  {isGenerating ? (
                    <div className="h-10 bg-white/[0.03] rounded-lg flex items-center justify-center border border-white/[0.05]">
                      <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                  ) : myCode ? (
                    <div className="flex gap-1.5">
                      <div className="flex-1 h-10 bg-white/[0.03] rounded-lg flex items-center px-3 text-white/50 text-[11px] font-mono truncate border border-white/[0.05]">
                        {referralLink}
                      </div>
                      <button
                        onClick={() => copyToClipboard(referralLink)}
                        className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center border border-white/[0.05] transition-colors"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </button>
                      <button
                        onClick={shareLink}
                        className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center border border-white/[0.05] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/[0.04]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#09090b] px-3 text-[9px] uppercase tracking-widest text-white/15 font-medium">
                      or redeem a code
                    </span>
                  </div>
                </div>

                {/* Redeem */}
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Enter code..."
                    value={referralCode}
                    onChange={(e) =>
                      setReferralCode(e.target.value.toUpperCase())
                    }
                    className="h-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/15 rounded-lg focus:border-cyan-500/30 focus:ring-cyan-500/10 font-mono text-sm"
                  />
                  <Button
                    onClick={handleRedeemReferral}
                    disabled={isRedeeming || !referralCode}
                    className="h-10 px-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg font-semibold text-sm text-white border-0 shrink-0"
                  >
                    {isRedeeming ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Redeem"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ═══════ UPGRADE ═══════ */}
            {activeTab === "upgrade" && (
              <div className="animate-in fade-in duration-200">
                <div className="relative p-5 rounded-xl overflow-hidden border border-cyan-500/10">
                  {/* Gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-[#09090b] to-blue-900/10" />

                  <div className="relative">
                    {/* Pro badge */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/15">
                        <Crown className="w-5.5 h-5.5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                          Cryonex student plans
                        </h3>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          Text and study value first, premium media metered
                          separately
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {[
                        "Free for ad-supported studying",
                        "Plus for smoother monthly study usage",
                        "Pro for soft-unlimited study help",
                        "Image and video generation stay credit-metered",
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-cyan-400" />
                          </div>
                          <span className="text-xs text-white/50 font-medium">
                            {text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      onClick={handleUpgrade}
                      className={cn(
                        "w-full h-11 rounded-xl font-bold text-sm border-0",
                        "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
                        "hover:from-cyan-400 hover:to-blue-400",
                        "shadow-lg shadow-cyan-500/10",
                        "transition-all duration-300 active:scale-[0.98]",
                        "group",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        View pricing
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
