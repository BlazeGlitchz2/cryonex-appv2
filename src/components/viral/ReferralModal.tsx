import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Gift, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ReferralModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
    const { user } = useAuth();
    const generateCode = useMutation(api.viral.generateAffiliateCode);
    const redeemCode = useMutation(api.viral.redeemCode);
    const balance = useQuery(api.credits.getBalance) || 0;

    const [inputCode, setInputCode] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [myCode, setMyCode] = useState<string | null>(null);

    useEffect(() => {
        if (open && user && !user.affiliateCode) {
            generateCode().then(setMyCode).catch(console.error);
        } else if (user?.affiliateCode) {
            setMyCode(user.affiliateCode);
        }
    }, [open, user, generateCode]);

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode);
            toast.success("Referral code copied!");
        }
    };

    const handleRedeem = async () => {
        if (!inputCode) return;
        setIsRedeeming(true);
        try {
            const result = await redeemCode({ code: inputCode });
            if (result.success) {
                toast.success(`Redeemed! You earned 50 credits from ${result.referrerName}`);
                setInputCode("");
                onOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to redeem code");
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-6 h-6 text-purple-500" />
                        Refer & Earn
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Invite friends to Cryonex and earn credits for every signup.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Credit Balance */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Current Balance</p>
                            <p className="text-2xl font-bold text-white">{balance} Credits</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Gift className="w-5 h-5 text-purple-400" />
                        </div>
                    </div>

                    {/* My Code */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Your Referral Code</label>
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center font-mono text-lg tracking-widest text-purple-300">
                                {myCode || <Loader2 className="w-4 h-4 animate-spin" />}
                            </div>
                            <Button onClick={handleCopy} className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20" size="icon">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-white/40">
                            Share this code. You get <span className="text-purple-400 font-bold">500 credits</span>, they get <span className="text-blue-400 font-bold">50 credits</span>.
                        </p>
                    </div>

                    {/* Redeem Code */}
                    {!user?.referredBy && (
                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <label className="text-sm font-medium text-white/70">Have a code?</label>
                            <div className="flex gap-2">
                                <Input
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER CODE"
                                    className="h-12 bg-black/40 border-white/10 rounded-xl font-mono uppercase placeholder:normal-case"
                                    maxLength={6}
                                />
                                <Button
                                    onClick={handleRedeem}
                                    disabled={isRedeeming || !inputCode}
                                    className="h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                                >
                                    {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {user?.referredBy && (
                        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>You have already redeemed a referral code.</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
