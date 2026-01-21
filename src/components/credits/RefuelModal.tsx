import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Zap, Users, Crown, Play, Check, Sparkles,
    Gift, ArrowRight, Star, Rocket, Shield,
    X, Copy, Link, Share2
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

interface RefuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'main' | 'study';
}

export function RefuelModal({ isOpen, onClose, type }: RefuelModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'watch' | 'refer' | 'upgrade'>('watch');
    const [referralCode, setReferralCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isWatching, setIsWatching] = useState(false);
    const [myCode, setMyCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const redeemReferral = useMutation(api.credits.redeemReferral);
    const claimAdReward = useMutation(api.credits.claimAdReward);
    const getOrCreateCode = useMutation(api.affiliates.getOrCreateCode);
    const affiliateStats = useQuery(api.affiliates.getStats);

    // Load user's referral code when refer tab is opened
    useEffect(() => {
        if (activeTab === 'refer' && !myCode && !isGenerating) {
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

    const referralLink = myCode ? `${window.location.origin}/login?ref=${myCode}` : '';

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
                    title: 'Join Cryonex AI',
                    text: 'Use my referral link to get 10 bonus credits!',
                    url: referralLink,
                });
            } catch (err) {
                copyToClipboard(referralLink);
            }
        } else {
            copyToClipboard(referralLink);
        }
    };

    const handleWatchAd = async () => {
        setIsWatching(true);

        const width = 800;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        // Use the VAST URL as the landing page for the popup
        const adWindow = window.open(
            "https://adeptspiritual.com/dUm-FDzMd.GCN/vMZZGcUV/UexmP9yuWZDU/lck/P/TcYV3/NPTYMBxdMyzNUjtDN/j/cN1yM_z/Eqz/Nygx",
            "AdWindow",
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        if (!adWindow || adWindow.closed) {
            toast.error("Please allow popups to watch ads!");
            setIsWatching(false);
            return;
        }

        // Award credits after 15 seconds of the window being open
        setTimeout(async () => {
            try {
                await claimAdReward({ creditType: type });
                toast.success("🎉 You earned 5 credits!");
                if (adWindow && !adWindow.closed) adWindow.close();
                onClose();
            } catch (error: any) {
                toast.error(error.message || "Failed to reward credits");
            } finally {
                setIsWatching(false);
            }
        }, 15000);
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
        navigate('/plans');
    };

    const tabs = [
        { id: 'watch' as const, label: 'Watch Ad', icon: Play, color: 'from-yellow-500 to-orange-500' },
        { id: 'refer' as const, label: 'Refer', icon: Gift, color: 'from-blue-500 to-cyan-500' },
        { id: 'upgrade' as const, label: 'Upgrade', icon: Crown, color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-0 shadow-none overflow-hidden">
                {/* Main container with glass effect */}
                <div className="relative rounded-3xl overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

                    {/* Glow effects */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                    {/* Content */}
                    <div className="relative p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50" />
                                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Refuel Station</h2>
                                    <p className="text-sm text-white/50">Get more {type === 'main' ? 'credits' : 'energy'}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white/50" />
                            </button>
                        </div>

                        {/* Tab navigation */}
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                                        activeTab === tab.id
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="min-h-[300px]">
                            {/* Watch Ad Tab */}
                            {activeTab === 'watch' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="text-center py-4">
                                        <div className="relative inline-block mb-4">
                                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                                <Play className="w-10 h-10 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Quick Refuel</h3>
                                        <p className="text-white/50 text-sm max-w-xs mx-auto">
                                            Watch a video ad and earn <span className="text-yellow-400 font-bold">+5 credits</span> instantly
                                        </p>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={handleWatchAd}
                                        disabled={isWatching}
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-bold text-lg",
                                            "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
                                            "hover:from-yellow-400 hover:via-orange-400 hover:to-red-400",
                                            "shadow-[0_0_30px_rgba(251,146,60,0.3)]",
                                            "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(251,146,60,0.4)]",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {isWatching ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Watching... 15s
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Play className="w-5 h-5 fill-current" />
                                                Watch Ad Now
                                                <Sparkles className="w-5 h-5" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Refer Tab */}
                            {activeTab === 'refer' && (
                                <div className="space-y-5 animate-in fade-in duration-300">
                                    {/* Your Referral Link Section */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Link className="w-4 h-4 text-cyan-400" />
                                            <span className="text-sm font-medium text-white">Your Referral Link</span>
                                            {affiliateStats && (
                                                <span className="ml-auto text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                                                    {affiliateStats.signups || 0} referrals
                                                </span>
                                            )}
                                        </div>

                                        {isGenerating ? (
                                            <div className="h-12 bg-black/30 rounded-xl flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                            </div>
                                        ) : myCode ? (
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-12 bg-black/30 rounded-xl flex items-center px-4 text-white/70 text-sm font-mono truncate">
                                                    {referralLink}
                                                </div>
                                                <Button
                                                    onClick={() => copyToClipboard(referralLink)}
                                                    className="h-12 px-4 bg-cyan-500 hover:bg-cyan-400 rounded-xl"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    onClick={shareLink}
                                                    className="h-12 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : null}

                                        <p className="text-xs text-white/40 mt-2">
                                            Share this link with friends. You both get <span className="text-cyan-400">+10 credits</span> when they sign up!
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-slate-900 px-3 text-white/40">or redeem a code</span>
                                        </div>
                                    </div>

                                    {/* Redeem Section */}
                                    <div className="space-y-3">
                                        <label className="text-sm text-white/70 font-medium">Have a friend's code?</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter referral code..."
                                                value={referralCode}
                                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 font-mono"
                                            />
                                            <Button
                                                onClick={handleRedeemReferral}
                                                disabled={isRedeeming || !referralCode}
                                                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-xl font-bold"
                                            >
                                                {isRedeeming ? "..." : "Redeem"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upgrade Tab */}
                            {activeTab === 'upgrade' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="relative p-6 rounded-2xl overflow-hidden">
                                        {/* Premium card background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20" />
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />

                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                                    <Crown className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">Go Unlimited</h3>
                                                    <p className="text-xs text-white/50">Never run out again</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                                        PRO
                                                    </span>
                                                </div>
                                            </div>

                                            <ul className="space-y-3 mb-6">
                                                {[
                                                    { icon: Zap, text: 'Unlimited AI Messages' },
                                                    { icon: Rocket, text: 'Priority Processing' },
                                                    { icon: Shield, text: 'Premium Support' },
                                                    { icon: Star, text: 'Early Access Features' },
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-white/80">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        </div>
                                                        <span className="text-sm">{item.text}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                onClick={handleUpgrade}
                                                className={cn(
                                                    "w-full h-12 rounded-xl font-bold",
                                                    "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
                                                    "hover:from-purple-400 hover:via-pink-400 hover:to-orange-400",
                                                    "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
                                                    "transition-all duration-300 hover:scale-[1.02]"
                                                )}
                                            >
                                                <span className="flex items-center gap-2">
                                                    View Plans
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
