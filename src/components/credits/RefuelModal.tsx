import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Crown,
  Play,
  Check,
  Sparkles,
  Gift,
  ArrowRight,
  Star,
  Rocket,
  Shield,
  X,
  Copy,
  Link,
  Share2,
  Volume2,
  VolumeX,
  Eye,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
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

export function RefuelModal({ isOpen, onClose, type }: RefuelModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"view" | "refer" | "upgrade">(
    "view",
  );
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

  const redeemReferral = useMutation(api.credits.redeemReferral);
  const claimAdReward = useMutation(api.credits.claimAdReward);
  const getOrCreateCode = useMutation(api.affiliates.getOrCreateCode);
  const affiliateStats = useQuery(api.affiliates.getStats);

  // Cleanup timer on unmount or when modal closes
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
    if (activeTab === "refer" && !myCode && !isGenerating) {
      setIsGenerating(true);
      getOrCreateCode({})
        .then((result) => {
          setMyCode(result.code);
        })
        .catch((err) => {
          console.error("Failed to get referral code:", err);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [activeTab, myCode, isGenerating, getOrCreateCode]);

  // Also use existing affiliate code if available
  useEffect(() => {
    if (affiliateStats?.code && !myCode) {
      setMyCode(affiliateStats.code);
    }
  }, [affiliateStats, myCode]);

  const referralLink = myCode
    ? `${window.location.origin}/login?ref=${myCode}`
    : "";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
      } catch (err) {
        copyToClipboard(referralLink);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  const handleViewAd = async () => {
    // Check if on native platform (Android/iOS)
    if (isNativePlatform()) {
      // Use real AdMob rewarded ads
      setAdLoading(true);
      try {
        // Prepare the ad first
        await prepareRewardedAd();

        // Show the rewarded ad
        const result = await showRewardedAd();

        if (result.success && result.rewarded) {
          // User watched the full ad, claim credits
          await claimAdReward({ creditType: type });
          toast.success("🎉 You earned 5 credits!");
          onClose();
        } else if (!result.success) {
          toast.error(result.error || "Failed to load ad. Please try again.");
        } else {
          // User closed ad early, no reward
          toast.info("Watch the full ad to earn credits!");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to show ad");
      } finally {
        setAdLoading(false);
        // Prepare next ad
        prepareRewardedAd();
      }
    } else {
      // Web fallback - show iframe ad simulation
      setIsViewingAd(true);
      setCountdown(15);
      setCanClaim(false);

      // Start countdown
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
      await claimAdReward({ creditType: type });
      toast.success("🎉 You earned 5 credits!");
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
    navigate("/plans");
  };

  const tabs = [
    { id: "view" as const, label: "View Ad", icon: Eye },
    { id: "refer" as const, label: "Refer", icon: Gift },
    { id: "upgrade" as const, label: "Upgrade", icon: Crown },
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
      <DialogContent className="sm:max-w-[450px] p-0 bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden rounded-3xl">
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Refuel Station
              </h2>
              <p className="text-xs text-white/40 font-medium">
                Get more {type === "main" ? "credits" : "energy"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Tab navigation */}
          {!isViewingAd && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8 border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-white/10 text-white shadow-sm border border-white/5"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5",
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      activeTab === tab.id ? "text-cyan-400" : "text-current",
                    )}
                  />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          <div className="min-h-[280px] flex flex-col">
            {/* View Ad Tab */}
            {activeTab === "view" && (
              <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-300">
                {!isViewingAd ? (
                  <>
                    <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-cyan-500/20">
                        <Eye className="w-8 h-8 text-cyan-400 ml-1" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        View & Earn
                      </h3>
                      <p className="text-white/40 text-sm max-w-[200px]">
                        Get{" "}
                        <span className="text-cyan-400 font-bold">
                          +5 credits
                        </span>{" "}
                        instantly by viewing an ad.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleViewAd}
                      disabled={adLoading}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold text-sm",
                        "bg-white text-black hover:bg-white/90",
                        "transition-all duration-300",
                      )}
                    >
                      {adLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Loading Ad...
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {isNativePlatform() ? "Watch Ad Now" : "View Ad Now"}
                        </span>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="relative flex-1 bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden min-h-[500px] shadow-2xl shadow-black/50">
                      {/* Window Header */}
                      <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/5 flex items-center px-4 z-10 backdrop-blur-md">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                        </div>
                        <span className="ml-4 text-[10px] font-medium text-white/30 uppercase tracking-widest">
                          Sponsored Content
                        </span>

                        {/* Countdown Overlay */}
                        <div className="ml-auto px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-cyan-400">
                            {countdown}s
                          </span>
                        </div>
                      </div>

                      <iframe
                        src="https://otieu.com/4/10494221"
                        className="w-full h-full border-none pt-10"
                        title="Advertisement"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        Viewing Ad
                      </h3>
                      <p className="text-[10px] text-white/40">
                        Reward available in {countdown} seconds
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleClaimReward}
                      disabled={!canClaim || isWatching}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold text-sm",
                        canClaim
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white/5 text-white/30 border border-white/10",
                        "transition-all duration-300",
                      )}
                    >
                      {isWatching ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canClaim ? (
                        <span className="flex items-center gap-2">
                          Claim +5 Credits
                          <Sparkles className="w-4 h-4" />
                        </span>
                      ) : (
                        <span>Wait {countdown}s to claim...</span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Refer Tab */}
            {activeTab === "refer" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Your Referral Link Section */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Link className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-medium text-white/70">
                      Your Referral Link
                    </span>
                    {affiliateStats && (
                      <span className="ml-auto text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {affiliateStats.signups || 0} referrals
                      </span>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="h-10 bg-black/30 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                  ) : myCode ? (
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-black/50 rounded-lg flex items-center px-3 text-white/70 text-xs font-mono truncate border border-white/5">
                        {referralLink}
                      </div>
                      <Button
                        onClick={() => copyToClipboard(referralLink)}
                        className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 rounded-lg border border-white/5"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/70" />
                        )}
                      </Button>
                      <Button
                        onClick={shareLink}
                        className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 rounded-lg border border-white/5"
                      >
                        <Share2 className="w-4 h-4 text-white/70" />
                      </Button>
                    </div>
                  ) : null}

                  <p className="text-[10px] text-white/30 mt-2">
                    Both you and your friend get{" "}
                    <span className="text-cyan-400 font-medium">
                      +10 credits
                    </span>
                    .
                  </p>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-[#0A0A0A] px-2 text-white/20">
                      or redeem
                    </span>
                  </div>
                </div>

                {/* Redeem Section */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code..."
                      value={referralCode}
                      onChange={(e) =>
                        setReferralCode(e.target.value.toUpperCase())
                      }
                      className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus:border-cyan-500/50 focus:ring-cyan-500/20 font-mono text-sm"
                    />
                    <Button
                      onClick={handleRedeemReferral}
                      disabled={isRedeeming || !referralCode}
                      className="h-10 px-4 bg-cyan-500 hover:bg-cyan-400 rounded-lg font-medium text-sm text-black"
                    >
                      {isRedeeming ? "..." : "Redeem"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Tab */}
            {activeTab === "upgrade" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative p-5 rounded-xl overflow-hidden border border-purple-500/20">
                  {/* Premium card background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Cryonex PRO
                        </h3>
                        <p className="text-[10px] text-white/40">
                          Unlock full potential
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {[
                        { text: "Unlimited AI Messages" },
                        { text: "Priority Processing" },
                        { text: "Premium Support" },
                        { text: "Early Access Features" },
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-white/60"
                        >
                          <div className="w-4 h-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-purple-400" />
                          </div>
                          <span className="text-xs">{item.text}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={handleUpgrade}
                      className={cn(
                        "w-full h-10 rounded-lg font-bold text-sm",
                        "bg-white text-black hover:bg-white/90",
                        "transition-all duration-300",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        View Plans
                        <ArrowRight className="w-3.5 h-3.5" />
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
