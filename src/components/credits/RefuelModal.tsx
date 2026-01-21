import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Users, Crown, Play, Copy, Check } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface RefuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'main' | 'study';
}

export function RefuelModal({ isOpen, onClose, type }: RefuelModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("watch");
    const [referralCode, setReferralCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);

    const addCredits = useMutation(api.credits.addCredits);
    const addStudyCredits = useMutation(api.credits.addStudyCredits);
    const redeemReferral = useMutation(api.credits.redeemReferral);

    // Mock function for watching ad
    const handleWatchAd = async () => {
        // Open the ad link
        window.open("https://otieu.com/4/10494221", "_blank");

        toast.info("Verifying ad view...");

        // Simulate verification delay
        setTimeout(async () => {
            try {
                if (type === 'main') {
                    await addCredits({ userId: undefined as any, amount: 5, reason: "Ad watch reward" }); // userId is handled by backend auth
                } else {
                    await addStudyCredits({ userId: undefined as any, amount: 5, reason: "Ad watch reward" });
                }
                toast.success("You earned 5 credits!");
                onClose();
            } catch (error) {
                toast.error("Failed to reward credits");
            }
        }, 15000); // Wait 15s to simulate "watching"
    };

    const handleRedeemReferral = async () => {
        if (!referralCode.trim()) return;

        setIsRedeeming(true);
        try {
            const result = await redeemReferral({ referralCode });
            toast.success(result.message);
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to redeem code");
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleUpgrade = () => {
        onClose();
        navigate('/plans');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        Refuel Your {type === 'main' ? 'Credits' : 'Study Energy'}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="watch" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-white/5">
                        <TabsTrigger value="watch">Watch Ad</TabsTrigger>
                        <TabsTrigger value="refer">Refer Friends</TabsTrigger>
                        <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
                    </TabsList>

                    <TabsContent value="watch" className="mt-4">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Quick Refuel</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Watch a short video to earn 5 credits instantly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center py-8">
                                <Button
                                    size="lg"
                                    onClick={handleWatchAd}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 h-auto shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all hover:scale-105"
                                >
                                    <Play className="w-6 h-6 mr-2 fill-black" />
                                    Watch Ad (+5 Credits)
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="refer" className="mt-4">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Invite & Earn</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Both you and your friend get 10 credits when they use your code.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Have a referral code?</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter code here"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value)}
                                            className="bg-black/50 border-white/10 text-white"
                                        />
                                        <Button
                                            onClick={handleRedeemReferral}
                                            disabled={isRedeeming || !referralCode}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isRedeeming ? "Checking..." : "Redeem"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black/90 px-2 text-gray-500">Or share your link</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col items-center text-center gap-2">
                                    <Users className="w-8 h-8 text-blue-400" />
                                    <p className="text-sm text-blue-200">
                                        Your unique referral code will be generated when you create your first affiliate link in settings.
                                    </p>
                                    {/* TODO: Fetch and display actual user affiliate code if available */}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="upgrade" className="mt-4">
                        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-400" />
                                    Go Unlimited
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Upgrade to Pro and never worry about credits again.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" /> Unlimited AI Chat
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" /> Unlimited PDF Uploads
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" /> Priority Support
                                    </li>
                                </ul>
                                <Button
                                    onClick={handleUpgrade}
                                    className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                                >
                                    View Plans
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
