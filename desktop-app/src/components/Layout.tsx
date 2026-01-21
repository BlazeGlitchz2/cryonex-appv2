import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import {
    LayoutDashboard,
    MessageSquare,
    Cpu,
    Download,
    LogOut,
    Settings,
    Search,
    Zap
} from "lucide-react";

export function Layout() {
    const { signOut } = useAuthActions();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: MessageSquare, label: "Assistant", path: "/chat" },
        { icon: Cpu, label: "System", path: "/system" },
        { icon: Download, label: "Downloads", path: "/downloads" },
    ];

    return (
        <div className="flex h-screen bg-[#050510] text-white overflow-hidden font-sans">
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className="relative z-50 w-[280px] h-full p-4 flex flex-col">
                <div className="glass-panel h-full rounded-[2rem] flex flex-col overflow-hidden border border-white/5 shadow-2xl">
                    {/* Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Zap className="text-white fill-white" size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-wide">Cryonex</h1>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Desktop</p>
                            </div>
                        </div>

                        {/* Search Placeholder */}
                        <div className="relative group mb-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-black/40 border border-white/10 rounded-xl flex items-center px-3 py-2.5 gap-2">
                                <Search size={16} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm w-full text-gray-300 placeholder-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                            ? "bg-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full" />
                                    )}
                                    <item.icon size={20} className={`transition-transform duration-300 ${isActive ? "scale-110 text-cyan-400" : "group-hover:scale-110"}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 mt-auto">
                        <div className="glass-card p-4 rounded-xl mb-4 border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                                    <Zap size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Pro Plan</p>
                                    <p className="text-[10px] text-gray-400">Active</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
