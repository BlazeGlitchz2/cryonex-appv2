import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Palette,
  Upload,
  Sparkles,
  ChevronRight,
  LogOut,
  Check,
  Globe,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useThemeStore } from "@/lib/stores/theme-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceSettings } from "@/components/settings/PerformanceSettings";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteUser = useMutation(api.users.deleteUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatarStorageId = useMutation(api.files.saveAvatarStorageId);

  const { theme, setTheme, mode, toggleMode } = useThemeStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [region, setRegion] = useState(user?.region || "");
  const [curriculum, setCurriculum] = useState(user?.curriculum || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name, email, region, curriculum });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    setIsLoading(true);
    try {
      await deleteUser({});
      await signOut();
      navigate("/");
      toast.success("Account deleted");
    } catch (error) {
      toast.error("Failed to delete account");
      setIsLoading(false);
    }
  };

  const handleNotAvailable = () => {
    toast.info("This setting is managed by your login provider.");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      await saveAvatarStorageId({ storageId });
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your public profile",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize the interface",
    },
    {
      id: "account",
      label: "Account",
      icon: Shield,
      description: "Security and login methods",
    },
    {
      id: "regional",
      label: "Regional",
      icon: Globe,
      description: "Localized experience & language",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Email and push preferences",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Lock,
      description: "Data and visibility settings",
    },
  ];

  return (
    <div className="container max-w-6xl py-8 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden col-span-1 mb-6">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Settings
            </h1>
            <p className="text-sm text-white/50">Manage your preferences</p>
          </div>
          <div className="flex overflow-x-auto gap-2 px-4 pb-2 mobile-scroll-x no-select">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0 touch-target",
                  activeTab === item.id
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-3 flex-col gap-2">
          <div className="mb-6 px-4">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Settings
            </h1>
            <p className="text-sm text-white/50">Manage your preferences</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
                  activeTab === item.id
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    : "text-white/50 hover:text-white hover:bg-white/5",
                )}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 relative z-10",
                    activeTab === item.id ? "text-primary" : "text-current",
                  )}
                />
                <div className="relative z-10">
                  <span className="font-medium block">{item.label}</span>
                </div>
                {activeTab === item.id && (
                  <ChevronRight className="h-4 w-4 ml-auto relative z-10 text-white/50" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-9 lg:col-span-9 h-full overflow-y-auto custom-scrollbar md:pr-2 pb-24 md:pb-0">
          <LiquidGlass
            className="min-h-full rounded-[2rem] p-5 md:p-8"
            intensity="low"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Header for Mobile/Context */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    {menuItems.find((i) => i.id === activeTab)?.icon && (
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        {(() => {
                          const Icon = menuItems.find(
                            (i) => i.id === activeTab,
                          )!.icon;
                          return <Icon className="h-6 w-6 text-primary" />;
                        })()}
                      </div>
                    )}
                    {menuItems.find((i) => i.id === activeTab)?.label}
                  </h2>
                  <p className="text-white/50 mt-1">
                    {menuItems.find((i) => i.id === activeTab)?.description}
                  </p>
                </div>

                {activeTab === "profile" && (
                  <div className="space-y-8 max-w-2xl">
                    <div className="flex items-center gap-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-white/10 shadow-xl">
                          <AvatarImage src={user?.image} />
                          <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Upload className="h-6 w-6 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-white">
                          Profile Photo
                        </h3>
                        <p className="text-sm text-white/50">
                          Click the image to upload a new one. <br />
                          Supports JPG, PNG or GIF. Max 5MB.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-white">
                          Display Name
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 h-12"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio" className="text-white">
                          Bio
                        </Label>
                        <Input
                          id="bio"
                          placeholder="Tell us about yourself"
                          className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 h-12"
                        />
                      </div>
                      <div className="pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="gap-2 bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl"
                        >
                          <Save className="h-4 w-4" /> Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-8">
                    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          Cosmic
                        </h3>
                        <p className="text-sm text-white/50">
                          Deep space vibes with vibrant gradients
                        </p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Dark Mode
                        </h3>
                        <p className="text-sm text-white/50">
                          Toggle between light and dark appearance
                        </p>
                      </div>
                      <Switch
                        checked={mode === "dark"}
                        onCheckedChange={toggleMode}
                      />
                    </div>

                    <PerformanceSettings />
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="space-y-8 max-w-2xl">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                      <div className="grid gap-2">
                        <Label className="text-white">Email Address</Label>
                        <div className="flex gap-3">
                          <Input
                            value={email}
                            readOnly
                            className="bg-black/20 border-white/10 text-white/70"
                          />
                          <Button
                            variant="outline"
                            onClick={handleNotAvailable}
                            className="border-white/10 hover:bg-white/10 text-white"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-white">Password</Label>
                        <div className="flex gap-3">
                          <Input
                            type="password"
                            value="********"
                            readOnly
                            className="bg-black/20 border-white/10 text-white/70"
                          />
                          <Button
                            variant="outline"
                            onClick={handleNotAvailable}
                            className="border-white/10 hover:bg-white/10 text-white"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
                      <div className="flex items-center gap-3 text-red-400">
                        <Shield className="h-5 w-5" />
                        <h3 className="font-semibold">Danger Zone</h3>
                      </div>
                      <p className="text-sm text-white/60">
                        Permanently remove your account and all of its contents
                        from the Cryonex platform. This action is not
                        reversible, so please continue with caution.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "regional" && (
                  <motion.div
                    key="regional"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        Regional Preferences
                      </h2>
                      <p className="text-white/50">
                        Tailor Cryonex to your local curriculum and language.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Study Region</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: "ksa", label: "Saudi Arabia", flag: "🇸🇦" },
                              { id: "egypt", label: "Egypt", flag: "🇪🇬" },
                              { id: "global", label: "International", flag: "🌍" },
                            ].map((r) => (
                              <button
                                key={r.id}
                                onClick={() => {
                                  setRegion(r.id);
                                  setCurriculum("");
                                }}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                  region === r.id
                                    ? "bg-primary/20 border-primary text-white"
                                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                                )}
                              >
                                <span className="text-xl">{r.flag}</span>
                                <span className="font-medium">{r.label}</span>
                                {region === r.id && (
                                  <Check className="h-4 w-4 ml-auto text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {region && (
                          <div className="space-y-2">
                            <Label>Active Curriculum</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {(region === "ksa"
                                ? [
                                  { id: "ksa_moe", label: "MoE (Public School)" },
                                  { id: "ksa_intl", label: "International" },
                                  { id: "ksa_uni", label: "University" },
                                ]
                                : region === "egypt"
                                  ? [
                                    { id: "egy_moe", label: "Thanaweyya Amma" },
                                    { id: "egy_intl", label: "IGCSE / SAT" },
                                    { id: "egy_uni", label: "University" },
                                  ]
                                  : [
                                    { id: "intl_high", label: "High School" },
                                    { id: "intl_uni", label: "University" },
                                  ]
                              ).map((c) => (
                                <button
                                  key={c.id}
                                  onClick={() => setCurriculum(c.id)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    curriculum === c.id
                                      ? "bg-white/10 border-white/20 text-white"
                                      : "bg-white/5 border-transparent text-white/50 hover:bg-white/10",
                                  )}
                                >
                                  <span className="text-sm font-medium">
                                    {c.label}
                                  </span>
                                  {curriculum === c.id && (
                                    <Check className="h-4 w-4 ml-auto text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="space-y-0.5">
                            <Label className="text-base">Arabic Content & RTL</Label>
                            <p className="text-sm text-white/50">
                              Optimize the UI for Arabic reading and Right-to-Left layout.
                            </p>
                          </div>
                          <Switch
                            checked={document.dir === "rtl"}
                            onCheckedChange={(checked) => {
                              document.dir = checked ? "rtl" : "ltr";
                              // In a real app, we'd persist this to user settings or localStorage
                              toast.info(`Layout switched to ${checked ? "Right-to-Left" : "Left-to-Right"}`);
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Regional Preferences"}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-4 max-w-2xl">
                    {[
                      {
                        title: "Email Notifications",
                        desc: "Receive updates about your account via email.",
                      },
                      {
                        title: "Marketing Emails",
                        desc: "Receive news and special offers.",
                      },
                      {
                        title: "Security Alerts",
                        desc: "Get notified about suspicious activity.",
                      },
                      {
                        title: "Product Updates",
                        desc: "Be the first to know about new features.",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <Label className="text-base text-white">
                            {item.title}
                          </Label>
                          <p className="text-sm text-white/50">{item.desc}</p>
                        </div>
                        <Switch />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                      <Lock className="h-10 w-10 text-white/30" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Privacy Center
                    </h3>
                    <p className="text-white/50 max-w-md">
                      We are working on advanced privacy controls. For now, rest
                      assured your data is encrypted and private by default.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
