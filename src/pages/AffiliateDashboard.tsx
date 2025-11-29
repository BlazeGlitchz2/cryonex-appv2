import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, DollarSign, Users, MousePointer, TrendingUp, Share2, QrCode, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AffiliateDashboard() {
    const stats = useQuery(api.affiliates.getStats);
    const leaderboard = useQuery(api.affiliates.getLeaderboard);
    const createAffiliate = useMutation(api.affiliates.create);

    const copyLink = () => {
        if (!stats?.code) return;
        const url = `${window.location.origin}/onboarding?ref=${stats.code}`;
        navigator.clipboard.writeText(url);
        toast.success("Affiliate link copied!");
    };

    const getQrCodeUrl = (code: string) => {
        const url = `${window.location.origin}/onboarding?ref=${code}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=000000&color=ffffff&margin=10`;
    };

    if (stats === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse mx-auto">
                        <div className="h-6 w-6 bg-white/20 rounded-md" />
                    </div>
                    <p className="text-sm text-white/40">Loading...</p>
                </div>
            </div>
        );
    }

    if (stats === null) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">Become an Affiliate</h2>
                    <p className="text-white/60 max-w-md mx-auto">
                        Join our affiliate program and earn rewards for referring new users to Cryonex.
                    </p>
                    <Button
                        onClick={() => createAffiliate({})}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    >
                        Generate Affiliate Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Affiliate Dashboard</h1>
                        <p className="text-white/50 mt-2 text-lg">Track your referrals and earnings</p>
                    </div>

                    <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 w-full md:w-auto min-w-[300px]">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex-1">
                                <div className="text-xs text-purple-300 font-medium mb-1">YOUR REFERRAL CODE</div>
                                <div className="text-xl font-mono font-bold text-white tracking-wider">{stats.code}</div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={copyLink} className="hover:bg-white/10">
                                <Copy className="w-4 h-4 text-white" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white/70">Total Clicks</CardTitle>
                                    <MousePointer className="h-4 w-4 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{stats.clicks}</div>
                                    <p className="text-xs text-white/40 mt-1">Unique visits to your link</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white/70">Signups</CardTitle>
                                    <Users className="h-4 w-4 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{stats.signups}</div>
                                    <p className="text-xs text-white/40 mt-1">Users who completed onboarding</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-white/70">Earnings</CardTitle>
                                    <DollarSign className="h-4 w-4 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">${stats.earnings.toFixed(2)}</div>
                                    <p className="text-xs text-white/40 mt-1">Pending payout</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">Recent Referrals</h3>
                            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <div className="grid grid-cols-3 p-4 border-b border-white/10 bg-white/5 text-sm font-medium text-white/70">
                                    <div>User</div>
                                    <div>Date Joined</div>
                                    <div>Status</div>
                                </div>
                                {stats.referrals && stats.referrals.length > 0 ? (
                                    stats.referrals.map((referral: any, i: number) => (
                                        <div key={i} className="grid grid-cols-3 p-4 border-b border-white/5 text-sm text-white/80 last:border-0 hover:bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
                                                    {referral.name[0]}
                                                </div>
                                                {referral.name}
                                            </div>
                                            <div>{new Date(referral.date).toLocaleDateString()}</div>
                                            <div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                                                    {referral.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        No referrals yet. Share your link to get started!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* QR Code Section */}
                        <Card className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-primary" />
                                    Your QR Code
                                </CardTitle>
                                <CardDescription className="text-white/50">
                                    Scan to join via your referral link
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center pb-6">
                                <div className="bg-white p-4 rounded-xl mb-4">
                                    <img 
                                        src={getQrCodeUrl(stats.code)} 
                                        alt="Affiliate QR Code" 
                                        className="w-40 h-40 mix-blend-multiply"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="w-full border-white/10 hover:bg-white/5 text-white" onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = getQrCodeUrl(stats.code);
                                    link.download = `cryonex-qr-${stats.code}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}>
                                    Download QR Code
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Leaderboard Section */}
                        <Card className="bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/20">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    Top Referrers
                                </CardTitle>
                                <CardDescription className="text-white/50">
                                    Competition Leaderboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {leaderboard ? (
                                        leaderboard.map((user: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        i === 0 ? "bg-yellow-500 text-black" :
                                                        i === 1 ? "bg-gray-300 text-black" :
                                                        i === 2 ? "bg-amber-700 text-white" :
                                                        "bg-white/10 text-white/60"
                                                    }`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">
                                                            {user.name}
                                                            {user.code === stats.code && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">YOU</span>}
                                                        </span>
                                                        <span className="text-[10px] text-white/40 font-mono">{user.code}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-white">{user.signups}</div>
                                                    <div className="text-[10px] text-white/40">Invites</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-white/40 text-sm">Loading leaderboard...</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}