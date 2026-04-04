import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Settings,
  LogOut,
  UserPlus,
  ChevronRight,
  Check,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { hapticSelection, hapticFeedback, isIOS } from "@/lib/mobile";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface LinkedAccount {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface MobileUserMenuProps {
  compact?: boolean;
}

const LINKED_ACCOUNTS_KEY = "cryonex_linked_accounts";

function MobileShellAvatar({
  image,
  name,
  size,
  className,
}: {
  image?: string;
  name?: string;
  size: number;
  className?: string;
}) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C";

  return (
    <Avatar
      className={cn(
        "shrink-0 border border-white/20 bg-white/5 text-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {image ? <AvatarImage src={image} alt={name || "User"} /> : null}
      <AvatarFallback className="bg-white/10 text-[11px] font-semibold text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function MobileUserMenu({ compact = false }: MobileUserMenuProps) {
  const navigate = useNavigate();
  const location = useLocation(); // Need location for active state
  const { user, signOut } = useAuth();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  const isActive = location.pathname.startsWith("/settings");

  // Load and sync linked accounts
  useEffect(() => {
    const stored = localStorage.getItem(LINKED_ACCOUNTS_KEY);
    if (stored) {
      try {
        setLinkedAccounts(JSON.parse(stored));
      } catch {
        setLinkedAccounts([]);
      }
    }
  }, []);

  // Add current user to linked accounts if not already there
  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(LINKED_ACCOUNTS_KEY);
      let accounts: LinkedAccount[] = [];
      if (stored) {
        try {
          accounts = JSON.parse(stored);
        } catch {
          accounts = [];
        }
      }

      const exists = accounts.some((acc) => acc.email === user.email);
      if (!exists) {
        const newAccount: LinkedAccount = {
          id: user._id || user.email,
          name: user.name || "User",
          email: user.email,
          image: user.image,
        };
        accounts.push(newAccount);
        localStorage.setItem(LINKED_ACCOUNTS_KEY, JSON.stringify(accounts));
        setLinkedAccounts(accounts);
      } else {
        // Update existing account info
        const updated = accounts.map((acc) =>
          acc.email === user.email
            ? {
                ...acc,
                name: user.name || acc.name,
                image: user.image || acc.image,
              }
            : acc,
        );
        localStorage.setItem(LINKED_ACCOUNTS_KEY, JSON.stringify(updated));
        setLinkedAccounts(updated);
      }
    }
  }, [user]);

  const handleSwitchAccount = async (account: LinkedAccount) => {
    if (account.email === user?.email) {
      toast.info("You're already using this account");
      return;
    }

    const toastId = toast.loading("Switching account...");

    try {
      await Promise.race([
        signOut(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      toast.dismiss(toastId);
      navigate(`/login?hint=${encodeURIComponent(account.email)}&auto=true`);
    }
  };

  const handleAddAccount = async () => {
    setShowAccountSwitcher(false);
    const toastId = toast.loading("Redirecting to add account...");

    try {
      await Promise.race([
        signOut(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      toast.dismiss(toastId);
      navigate("/login?action=add_account");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleMenuClick = () => {
    if (isIOS()) {
      hapticSelection();
    } else {
      hapticFeedback("light");
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={handleMenuClick}
            className={cn(
              "group relative flex flex-col items-center justify-center no-select transition-all duration-150",
              compact
                ? cn(
                    "min-h-[3.6rem] rounded-[1.35rem] px-2 py-2",
                    isActive
                      ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/80",
                  )
                : cn(
                    "py-2 px-1 rounded-2xl",
                    isActive ? "flex-[1.5] min-w-[64px]" : "flex-1 min-w-[44px]",
                  ),
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
              transform: "translateZ(0)",
            }}
          >
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <div className="relative mb-0.5">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <MobileShellAvatar
                  image={user.image}
                  name={user.name}
                  size={compact ? 22 : isActive ? 20 : 24}
                  className="relative ring-1 ring-black/50 transition-all duration-150"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-emerald-500 rounded-full border border-black shadow-lg shadow-emerald-500/50" />
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium leading-none tracking-[0.02em]",
                  compact
                    ? isActive
                      ? "text-white"
                      : "text-white/60"
                    : isActive
                      ? "text-white animate-in fade-in zoom-in duration-200"
                      : "text-white/60",
                )}
              >
                Profile
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-72 p-0 overflow-hidden bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-2xl mb-2"
        >
          {/* User Info Header */}
          <div className="relative p-4 border-b border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <MobileShellAvatar
                  image={user.image}
                  name={user.name}
                  size={48}
                  className="border-2 border-white/10"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#0A0A0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
              <div
                className={cn(
                  "px-2 py-0.5 rounded-full border",
                  user.tier === "PRO"
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/20"
                    : user.tier === "PLUS"
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30"
                      : "bg-white/5 border-white/10",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    user.tier === "PRO"
                      ? "text-blue-300"
                      : user.tier === "PLUS"
                        ? "text-amber-200"
                        : "text-white/40",
                  )}
                >
                  {user.tier || "FREE"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <DropdownMenuItem
              onClick={() => setShowAccountSwitcher(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 focus:bg-white/5 hover:bg-white/5 group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all border border-white/5">
                <Users className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white/90">
                  Switch Accounts
                </span>
                <p className="text-[10px] text-white/40">
                  {linkedAccounts.length} linked
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 focus:bg-white/5 hover:bg-white/5 group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all border border-white/5">
                <Settings className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-white/90">
                Settings
              </span>
              <ChevronRight className="h-4 w-4 text-white/30 ml-auto group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2 bg-white/5" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 focus:bg-red-500/10 hover:bg-red-500/10 group"
            >
              <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all border border-red-500/10">
                <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
              </div>
              <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
                Log out
              </span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAccountSwitcher} onOpenChange={setShowAccountSwitcher}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0A0A0B]/98 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl">
          <div className="relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl pointer-events-none" />

            <DialogHeader className="relative p-6 pb-4">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Switch Accounts
              </DialogTitle>
              <p className="text-sm text-white/40 mt-1">
                Select an account to switch to
              </p>
            </DialogHeader>

            <div className="relative px-6 pb-4 space-y-2">
              <AnimatePresence>
                {linkedAccounts.map((account, index) => (
                  <motion.button
                    key={account.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSwitchAccount(account)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group border",
                      account.email === user?.email
                        ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10",
                    )}
                  >
                    <div className="relative">
                      <MobileShellAvatar
                        image={account.image}
                        name={account.name}
                        size={44}
                        className="border-2 border-white/10"
                      />
                      {account.email === user?.email && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-[#0A0A0B] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">
                        {account.name}
                      </p>
                      <p className="text-xs text-white/40">{account.email}</p>
                    </div>
                    {account.email === user?.email ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        ACTIVE
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="relative p-6 pt-2 border-t border-white/5">
              <Button
                onClick={handleAddAccount}
                className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all group"
              >
                <UserPlus className="h-4 w-4 mr-2 text-white/60 group-hover:text-white transition-colors" />
                Add another account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
