import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useThemeStore } from "@/lib/stores/theme-store";

interface LinkedAccount {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface UserProfileMenuProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: (path: string) => void;
}

const LINKED_ACCOUNTS_KEY = "cryonex_linked_accounts";

function UserAvatar({
  image,
  name,
  size,
  className,
  isLight,
}: {
  image?: string;
  name?: string;
  size: number;
  className?: string;
  isLight?: boolean;
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
        "shrink-0 border",
        isLight
          ? "border-rose-200/80 bg-white/75 text-slate-900"
          : "border-white/10 bg-white/5 text-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {image ? <AvatarImage src={image} alt={name || "User"} /> : null}
      <AvatarFallback
        className={cn(
          "text-[11px] font-semibold",
          isLight ? "bg-rose-50 text-slate-900" : "bg-white/10 text-white",
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export const UserProfileMenu = React.memo(function UserProfileMenu({
  isCollapsed,
  isMobile,
  onNavigate,
}: UserProfileMenuProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLight = useThemeStore((state) => state.mode === "light");
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

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

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleSwitchAccount = async (account: LinkedAccount) => {
    if (account.email === user?.email) {
      toast.info("You're already using this account");
      return;
    }

    const toastId = toast.loading("Switching account...");

    try {
      // Race signOut with a timeout to prevent hanging
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
      // Race signOut with a timeout
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

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2.5 px-2 py-2 rounded-[14px] transition-all duration-200 group/profile focus:outline-none",
              isLight ? "hover:bg-accent" : "hover:bg-white/[0.04]",
              isCollapsed && "justify-center p-0 h-10 w-10 mx-auto",
            )}
          >
            <div className="relative shrink-0">
              <UserAvatar
                image={user.image}
                name={user.name}
                size={isCollapsed ? 36 : 32}
                isLight={isLight}
                className="relative transition-colors"
              />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 bg-emerald-500",
                  isLight ? "border-background" : "border-[#0A0625]",
                )}
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left flex items-center justify-between">
                <span
                  className={cn(
                    "truncate pr-2 text-[13px] font-medium transition-colors",
                    isLight ? "text-foreground" : "text-white/90",
                  )}
                >
                  {user.name || "User"}
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isLight
                      ? "text-muted-foreground group-hover/profile:text-foreground"
                      : "text-white/30 group-hover/profile:text-white/60",
                  )}
                />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side={isCollapsed ? "right" : "bottom"}
          sideOffset={8}
          className={cn(
            "w-72 rounded-2xl overflow-hidden p-0 backdrop-blur-2xl",
            isLight
              ? "border border-rose-200/80 bg-white/95 shadow-[0_24px_60px_rgba(236,72,153,0.12)]"
              : "border border-white/10 bg-[#0A0A0B]/95 shadow-2xl shadow-black/50",
          )}
        >
          {/* User Info Header */}
          <div
            className={cn(
              "relative p-4 border-b transition-colors",
              isLight ? "border-border/50" : "border-white/5",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br via-transparent",
                isLight
                  ? "from-primary/10 via-transparent to-accent/10"
                  : "from-purple-500/10 to-cyan-500/10",
              )}
            />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <UserAvatar
                  image={user.image}
                  name={user.name}
                  size={48}
                  isLight={isLight}
                  className={cn(
                    "border-2",
                    isLight ? "border-rose-200/80" : "border-white/10",
                  )}
                />
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-500",
                    isLight ? "border-background" : "border-[#0A0A0B]",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "truncate text-sm font-semibold",
                    isLight ? "text-slate-900" : "text-white",
                  )}
                >
                  {user.name || "User"}
                </p>
                <p
                  className={cn(
                    "truncate text-xs transition-colors",
                    isLight ? "text-muted-foreground" : "text-white/40",
                  )}
                >
                  {user.email}
                </p>
              </div>
              <div
                className={cn(
                  "px-2 py-0.5 rounded-full border",
                  user.tier === "PRO"
                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/20"
                    : user.tier === "PLUS"
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30"
                      : "bg-white/5 border-white/10",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    user.tier === "PRO"
                      ? "text-purple-300"
                      : user.tier === "PLUS"
                        ? "text-amber-200"
                        : isLight
                          ? "text-slate-500"
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                isLight
                  ? "focus:bg-accent hover:bg-accent"
                  : "focus:bg-white/5 hover:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isLight
                    ? "bg-muted border-border/50 group-hover:bg-primary/10"
                    : "bg-white/5 border-white/5 group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-cyan-500/20",
                )}
              >
                <Users
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isLight
                      ? "text-muted-foreground group-hover:text-primary"
                      : "text-white/60 group-hover:text-white",
                  )}
                />
              </div>
              <div className="flex-1">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isLight ? "text-foreground" : "text-white/90",
                  )}
                >
                  Switch Accounts
                </span>
                <p
                  className={cn(
                    "text-[10px] transition-colors",
                    isLight ? "text-muted-foreground" : "text-white/40",
                  )}
                >
                  {linkedAccounts.length} linked
                </p>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-all",
                  isLight
                    ? "text-muted-foreground/50 group-hover:text-foreground"
                    : "text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5",
                )}
              />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleNavigation("/settings")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group",
                isLight
                  ? "focus:bg-accent hover:bg-accent"
                  : "focus:bg-white/5 hover:bg-white/5",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isLight
                    ? "bg-muted border-border/50 group-hover:bg-primary/10"
                    : "bg-white/5 border-white/5 group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-cyan-500/20",
                )}
              >
                <Settings
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isLight
                      ? "text-muted-foreground group-hover:text-primary"
                      : "text-white/60 group-hover:text-white",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isLight ? "text-foreground" : "text-white/90",
                )}
              >
                Settings
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 ml-auto transition-all",
                  isLight
                    ? "text-muted-foreground/50 group-hover:text-foreground"
                    : "text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5",
                )}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator
              className={cn("my-2", isLight ? "bg-border/50" : "bg-white/5")}
            />

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

          {linkedAccounts.length > 1 && (
            <div
              className={cn(
                "p-3 border-t transition-colors",
                isLight ? "border-border/50 bg-accent/20" : "border-white/5 bg-white/[0.02]",
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider mb-2 px-1 transition-colors",
                  isLight ? "text-muted-foreground/60" : "text-white/30",
                )}
              >
                Quick Switch
              </p>
              <div className="flex gap-2">
                {linkedAccounts
                  .filter((acc) => acc.email !== user.email)
                  .slice(0, 3)
                  .map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleSwitchAccount(account)}
                      className="relative group/quick"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl opacity-0 group-hover/quick:opacity-100 blur transition-opacity" />
                      <UserAvatar
                        image={account.image}
                        name={account.name}
                        size={36}
                        isLight={isLight}
                        className={cn(
                          "relative border-2 transition-colors group-hover/quick:border-transparent",
                          isLight ? "border-border" : "border-white/10",
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Switcher Dialog */}
      <Dialog open={showAccountSwitcher} onOpenChange={setShowAccountSwitcher}>
        <DialogContent
          className={cn(
            "max-w-md p-0 overflow-hidden backdrop-blur-2xl shadow-2xl rounded-3xl",
            isLight
              ? "bg-background/98 border-border"
              : "bg-[#0A0A0B]/98 border-white/10",
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br pointer-events-none",
                isLight
                  ? "from-primary/5 via-transparent to-accent/5"
                  : "from-purple-500/5 via-transparent to-cyan-500/5",
              )}
            />
            <div
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] blur-3xl pointer-events-none",
                isLight ? "bg-primary/10" : "bg-purple-500/10",
              )}
            />

            <DialogHeader className="relative p-6 pb-4">
              <DialogTitle
                className={cn(
                  "text-xl font-bold flex items-center gap-3 transition-colors",
                  isLight ? "text-foreground" : "text-white",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all border",
                    isLight
                      ? "bg-primary/10 border-primary/20"
                      : "bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-white/10",
                  )}
                >
                  <Users className={isLight ? "h-5 w-5 text-primary" : "h-5 w-5 text-white"} />
                </div>
                Switch Accounts
              </DialogTitle>
              <p
                className={cn(
                  "text-sm mt-1 transition-colors",
                  isLight ? "text-muted-foreground" : "text-white/40",
                )}
              >
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
                        ? isLight
                          ? "bg-primary/5 border-primary/20"
                          : "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20"
                        : isLight
                          ? "bg-accent/30 border-border/50 hover:bg-accent/50 hover:border-border"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10",
                    )}
                  >
                    <div className="relative">
                      <UserAvatar
                        image={account.image}
                        name={account.name}
                        size={44}
                        isLight={isLight}
                        className={cn(
                          "border-2 transition-colors",
                          isLight ? "border-border" : "border-white/10",
                        )}
                      />
                      {account.email === user?.email && (
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 flex items-center justify-center",
                            isLight ? "border-background" : "border-[#0A0A0B]",
                          )}
                        >
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isLight ? "text-foreground" : "text-white",
                        )}
                      >
                        {account.name}
                      </p>
                      <p
                        className={cn(
                          "text-xs transition-colors",
                          isLight ? "text-muted-foreground" : "text-white/40",
                        )}
                      >
                        {account.email}
                      </p>
                    </div>
                    {account.email === user?.email ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        ACTIVE
                      </span>
                    ) : (
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-all",
                          isLight
                            ? "text-muted-foreground group-hover:text-foreground"
                            : "text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5",
                        )}
                      />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div
              className={cn(
                "relative p-6 pt-2 border-t transition-colors",
                isLight ? "border-border/50" : "border-white/5",
              )}
            >
              <Button
                onClick={handleAddAccount}
                className={cn(
                  "w-full h-12 rounded-xl transition-all group",
                  isLight
                    ? "bg-accent hover:bg-accent/80 text-foreground border-border"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20",
                )}
              >
                <UserPlus
                  className={cn(
                    "h-4 w-4 mr-2 transition-colors",
                    isLight
                      ? "text-muted-foreground group-hover:text-foreground"
                      : "text-white/60 group-hover:text-white",
                  )}
                />
                Add another account
              </Button>

              {linkedAccounts.length > 1 && (
                <p
                  className={cn(
                    "text-[10px] text-center mt-4 transition-colors",
                    isLight ? "text-muted-foreground/60" : "text-white/30",
                  )}
                >
                  Tip: Right-click on an account to remove it
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
