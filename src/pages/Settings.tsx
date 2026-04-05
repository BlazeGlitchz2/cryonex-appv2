import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Monitor,
  Sun,
  Moon,
  GraduationCap,
  Target,
  School,
  Clock,
  Briefcase,
  Users2,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useThemeStore } from "@/lib/stores/theme-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getAvailableClassSections } from "@/lib/schoolConfig";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceSettings } from "@/components/settings/PerformanceSettings";
import { COUNTRIES, GRADE_LEVELS } from "@/lib/countryConfig";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteUser = useMutation(api.users.deleteUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatarStorageId = useMutation(api.files.saveAvatarStorageId);

  const { mode, appearance, setAppearance } = useThemeStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [interestsInput, setInterestsInput] = useState(
    (user?.interests || []).join(", "),
  );
  const [region, setRegion] = useState(user?.region || "");
  const [curriculum, setCurriculum] = useState(user?.curriculum || "");
  const [classSection, setClassSection] = useState(user?.classSection || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Onboarding & Education Fields
  const [userRole, setUserRole] = useState(user?.userRole || "student");
  const [goals, setGoals] = useState<string[]>(user?.goals || []);
  const [gradeLevel, setGradeLevel] = useState(user?.gradeLevel || "");
  const [schoolId, setSchoolId] = useState(user?.schoolId || "");
  const [curriculumTrack, setCurriculumTrack] = useState(
    user?.curriculumTrack || "",
  );
  const [studyPace, setStudyPace] = useState(user?.studyPace || "balanced");
  const [schoolNetworkOptIn, setSchoolNetworkOptIn] = useState(
    user?.schoolNetworkOptIn || false,
  );
  const [discoverableInSchool, setDiscoverableInSchool] = useState(
    user?.discoverableInSchool || false,
  );
  const [profileVisibility, setProfileVisibility] = useState(
    user?.profileVisibility || "private",
  );
  const [targetSubjects, setTargetSubjects] = useState<string[]>(
    user?.targetSubjects || [],
  );
  const [targetExams, setTargetExams] = useState<string[]>(
    user?.targetExams || [],
  );
  const [country, setCountry] = useState(user?.country || "sa");
  const availableClassSections = useMemo(
    () => getAvailableClassSections(user?.schoolId, user?.gradeLevel),
    [user?.gradeLevel, user?.schoolId],
  );

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setBio(user?.bio || "");
    setInterestsInput((user?.interests || []).join(", "));
    setRegion(user?.region || "");
    setCurriculum(user?.curriculum || "");
    setClassSection(user?.classSection || "");

    setUserRole(user?.userRole || "student");
    setGoals(user?.goals || []);
    setGradeLevel(user?.gradeLevel || "");
    setSchoolId(user?.schoolId || "");
    setCurriculumTrack(user?.curriculumTrack || "");
    setStudyPace(user?.studyPace || "balanced");
    setSchoolNetworkOptIn(user?.schoolNetworkOptIn || false);
    setDiscoverableInSchool(user?.discoverableInSchool || false);
    setProfileVisibility(user?.profileVisibility || "private");
    setTargetSubjects(user?.targetSubjects || []);
    setTargetExams(user?.targetExams || []);
    setCountry(user?.country || "sa");
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        name,
        email,
        bio,
        region,
        curriculum,
        classSection: classSection || undefined,
        interests: interestsInput
          .split(",")
          .map((interest: string) => interest.trim())
          .filter(Boolean),
        userRole,
        goals,
        gradeLevel,
        schoolId: schoolId || undefined,
        curriculumTrack,
        studyPace: studyPace as any,
        schoolNetworkOptIn,
        discoverableInSchool,
        profileVisibility: profileVisibility as any,
        targetSubjects,
        targetExams,
        country,
      });
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
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      description: "School, grade, and study pacing",
    },
  ];

  const isLight = mode === "light";
  const appearanceOptions = [
    {
      id: "system" as const,
      label: "System",
      description: "Follow your device appearance automatically",
      icon: Monitor,
    },
    {
      id: "light" as const,
      label: "Light",
      description: "Aurora light mode with bright glass surfaces",
      icon: Sun,
    },
    {
      id: "dark" as const,
      label: "Dark",
      description: "Original cosmic mode with a darker aurora backdrop",
      icon: Moon,
    },
  ];

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] w-full max-w-[92rem] px-4 py-6 md:px-6 md:py-8">
      <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="md:hidden col-span-1 mb-6">
          <div className="px-4 mb-4">
            <h1
              className={cn(
                "text-2xl font-bold tracking-tight mb-1",
                isLight ? "text-slate-900" : "text-white",
              )}
            >
              Settings
            </h1>
            <p
              className={cn(
                "text-sm",
                isLight ? "text-slate-600" : "text-white/50",
              )}
            >
              Manage your preferences
            </p>
          </div>
          <div className="flex overflow-x-auto gap-2 px-4 pb-2 mobile-scroll-x no-select">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0 touch-target",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground",
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
            <h1
              className={cn(
                "text-2xl font-bold tracking-tight mb-1",
                isLight ? "text-slate-900" : "text-white",
              )}
            >
              Settings
            </h1>
            <p
              className={cn(
                "text-sm",
                isLight ? "text-slate-600" : "text-white/50",
              )}
            >
              Manage your preferences
            </p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
                  activeTab === item.id
                    ? "bg-accent/40 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20",
                )}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      "absolute inset-0 rounded-xl border",
                      isLight
                        ? "bg-card border-border shadow-sm"
                        : "bg-white/5 border-white/10",
                    )}
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
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 ml-auto relative z-10 text-muted-foreground/50",
                    )}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 py-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                isLight
                  ? "text-red-600 hover:text-red-700 hover:bg-red-500/10"
                  : "text-red-400 hover:text-red-300 hover:bg-red-500/10",
              )}
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 h-full overflow-y-auto pb-24 md:col-span-9 md:pr-2 md:pb-0 lg:col-span-9 custom-scrollbar">
          <LiquidGlass
            className={cn(
              "min-h-full rounded-[2rem] p-5 md:p-8",
              "border border-border bg-card/40 backdrop-blur-xl shadow-sm",
            )}
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
                  <h2
                    className="text-2xl font-bold flex items-center gap-3 text-foreground"
                  >
                    {menuItems.find((i) => i.id === activeTab)?.icon && (
                      <div
                        className={cn(
                          "p-2 rounded-lg border",
                          isLight
                            ? "bg-white/65 border-primary/10"
                            : "bg-white/5 border-white/10",
                        )}
                      >
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
                  <p
                    className={cn(
                      "mt-1",
                      isLight ? "text-slate-600" : "text-white/50",
                    )}
                  >
                    {menuItems.find((i) => i.id === activeTab)?.description}
                  </p>
                </div>

                {activeTab === "profile" && (
                  <div className="space-y-8 max-w-2xl">
                    <div
                      className={cn(
                        "flex items-center gap-8 p-6 rounded-2xl border",
                        isLight
                          ? "bg-white/55 border-primary/10"
                          : "bg-white/5 border-white/10",
                      )}
                    >
                      <div className="relative group">
                        <Avatar
                          className={cn(
                            "h-24 w-24 border-4 shadow-xl",
                            isLight ? "border-primary/10" : "border-white/10",
                          )}
                        >
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
                        <h3
                          className={cn(
                            "text-lg font-medium",
                            isLight ? "text-slate-900" : "text-white",
                          )}
                        >
                          Profile Photo
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            isLight ? "text-slate-600" : "text-white/50",
                          )}
                        >
                          Click the image to upload a new one. <br />
                          Supports JPG, PNG or GIF. Max 5MB.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="name"
                          className={isLight ? "text-slate-800" : "text-white"}
                        >
                          Display Name
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(
                            "h-12 focus:border-primary/50 focus:ring-primary/20",
                            isLight
                              ? "bg-white/70 border-primary/10" : "bg-white/5 border-white/10 text-white",
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label
                          htmlFor="bio"
                          className={isLight ? "text-slate-800" : "text-white"}
                        >
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          value={bio}
                          onChange={(event) => setBio(event.target.value)}
                          className={cn(
                            "min-h-[120px] focus:border-primary/50 focus:ring-primary/20",
                            isLight
                              ? "bg-white/70 border-primary/10" : "bg-white/5 border-white/10 text-white",
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label
                          htmlFor="interests"
                          className={isLight ? "text-slate-800" : "text-white"}
                        >
                          Interests
                        </Label>
                        <Input
                          id="interests"
                          value={interestsInput}
                          onChange={(event) =>
                            setInterestsInput(event.target.value)
                          }
                          placeholder="Biology, debate, robotics, SAT math"
                          className={cn(
                            "h-12 focus:border-primary/50 focus:ring-primary/20",
                            isLight
                              ? "bg-white/70 border-primary/10" : "bg-white/5 border-white/10 text-white",
                          )}
                        />
                        <p
                          className={cn(
                            "text-xs",
                            isLight ? "text-slate-500" : "text-white/45",
                          )}
                        >
                          Separate interests with commas so they appear on your
                          public profile.
                        </p>
                      </div>
                      {availableClassSections.length > 0 ? (
                        <div className="grid gap-2">
                          <Label
                            className={isLight ? "text-slate-800" : "text-white"}
                          >
                            Class section
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {availableClassSections.map((section) => (
                              <button
                                key={section}
                                type="button"
                                onClick={() => setClassSection(section)}
                                className={cn(
                                  "rounded-full border px-3 py-2 text-sm transition-colors",
                                  classSection === section
                                    ? "border-primary bg-primary/10 text-primary"
                                    : isLight
                                      ? "border-primary/10 bg-white/70 text-slate-700"
                                      : "border-white/10 bg-white/5 text-white/65",
                                )}
                              >
                                Section {section}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
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
                    <div
                      className={cn(
                        "p-6 rounded-2xl border relative overflow-hidden",
                        isLight
                          ? "border-primary/10 bg-white/55"
                          : "border-primary/20 bg-primary/5",
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <h3
                          className={cn(
                            "text-lg font-bold mb-1",
                            isLight ? "text-slate-900" : "text-white",
                          )}
                        >
                          Cosmic Aurora
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            isLight ? "text-slate-600" : "text-white/50",
                          )}
                        >
                          Light mode uses your requested pastel aurora glow, and
                          dark mode now mirrors it with a deeper atmospheric
                          aurora across the app shell.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {appearanceOptions.map((option) => {
                        const Icon = option.icon;
                        const active = appearance === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setAppearance(option.id)}
                            className={cn(
                              "rounded-2xl border p-5 text-left transition-all",
                              active
                                ? "border-primary bg-primary/10 shadow-[0_18px_40px_rgba(168,85,247,0.12)]"
                                : isLight
                                  ? "border-primary/10 bg-white/60 hover:bg-white/80"
                                  : "border-white/10 bg-white/5 hover:bg-white/10",
                            )}
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div
                                className={cn(
                                  "rounded-xl p-3",
                                  active
                                    ? "bg-primary text-white"
                                    : isLight
                                      ? "bg-primary/5 text-slate-700"
                                      : "bg-white/10 text-white/80",
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              {active && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <h3
                              className={cn(
                                "font-semibold",
                                isLight ? "text-slate-900" : "text-white",
                              )}
                            >
                              {option.label}
                            </h3>
                            <p
                              className={cn(
                                "mt-2 text-sm",
                                isLight ? "text-slate-600" : "text-white/50",
                              )}
                            >
                              {option.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div
                      className={cn(
                        "p-6 rounded-2xl border flex items-center justify-between",
                        isLight
                          ? "bg-white/55 border-primary/10"
                          : "bg-white/5 border-white/10",
                      )}
                    >
                      <div>
                        <h3
                          className={cn(
                            "text-lg font-medium",
                            isLight ? "text-slate-900" : "text-white",
                          )}
                        >
                          Resolved appearance
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            isLight ? "text-slate-600" : "text-white/50",
                          )}
                        >
                          Currently using {mode} mode
                          {appearance === "system"
                            ? " from your device preference"
                            : ""}
                          .
                        </p>
                      </div>
                      <Switch
                        checked={mode === "dark"}
                        onCheckedChange={(checked) =>
                          setAppearance(checked ? "dark" : "light")
                        }
                      />
                    </div>

                    <PerformanceSettings />
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="space-y-8 max-w-2xl">
                    <div
                      className={cn(
                        "space-y-6 rounded-2xl border p-6",
                        isLight
                          ? "border-primary/10 bg-white/65"
                          : "border-white/10 bg-white/5",
                      )}
                    >
                      <div className="grid gap-2">
                        <Label
                          className={isLight ? "text-slate-800" : "text-white"}
                        >
                          Email Address
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            value={email}
                            readOnly
                            className={cn(
                              isLight
                                ? "border-primary/10 bg-white text-slate-700"
                                : "border-white/10 bg-black/20 text-white/70",
                            )}
                          />
                          <Button
                            variant="outline"
                            onClick={handleNotAvailable}
                            className={cn(
                              isLight
                                ? "border-primary/10 bg-white text-slate-700 hover:bg-primary/5"
                                : "border-white/10 text-white hover:bg-white/10",
                            )}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label
                          className={isLight ? "text-slate-800" : "text-white"}
                        >
                          Password
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            type="password"
                            value="********"
                            readOnly
                            className={cn(
                              isLight
                                ? "border-primary/10 bg-white text-slate-700"
                                : "border-white/10 bg-black/20 text-white/70",
                            )}
                          />
                          <Button
                            variant="outline"
                            onClick={handleNotAvailable}
                            className={cn(
                              isLight
                                ? "border-primary/10 bg-white text-slate-700 hover:bg-primary/5"
                                : "border-white/10 text-white hover:bg-white/10",
                            )}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "space-y-4 rounded-2xl border p-6",
                        isLight
                          ? "border-red-200/80 bg-red-50/80"
                          : "border-red-500/20 bg-red-500/5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3",
                          isLight ? "text-red-600" : "text-red-400",
                        )}
                      >
                        <Shield className="h-5 w-5" />
                        <h3 className="font-semibold">Danger Zone</h3>
                      </div>
                      <p
                        className={cn(
                          "text-sm",
                          isLight ? "text-red-900/75" : "text-white/60",
                        )}
                      >
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
                      <h2
                        className={cn(
                          "mb-1 text-2xl font-bold",
                          isLight ? "text-slate-900" : "text-white",
                        )}
                      >
                        Regional Preferences
                      </h2>
                      <p
                        className={cn(
                          isLight ? "text-slate-600" : "text-white/50",
                        )}
                      >
                        Tailor Cryonex to your local curriculum and language.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            className={
                              isLight ? "text-slate-800" : "text-white"
                            }
                          >
                            Study Region
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: "ksa", label: "Saudi Arabia", flag: "🇸🇦" },
                              { id: "egypt", label: "Egypt", flag: "🇪🇬" },
                              {
                                id: "global",
                                label: "International",
                                flag: "🌍",
                              },
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
                                    ? "border-primary bg-primary/12 text-primary"
                                    : isLight
                                      ? "border-rose-200/80 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900"
                                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
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
                            <Label
                              className={
                                isLight ? "text-slate-800" : "text-white"
                              }
                            >
                              Active Curriculum
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                              {(region === "ksa"
                                ? [
                                    {
                                      id: "ksa_moe",
                                      label: "MoE (Public School)",
                                    },
                                    { id: "ksa_intl", label: "International" },
                                    { id: "ksa_uni", label: "University" },
                                  ]
                                : region === "egypt"
                                  ? [
                                      {
                                        id: "egy_moe",
                                        label: "Thanaweyya Amma",
                                      },
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
                                      ? isLight
                                        ? "border-primary bg-primary/10 text-slate-900"
                                        : "border-white/20 bg-white/10 text-white"
                                      : isLight
                                        ? "border-rose-200/70 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900"
                                        : "border-transparent bg-white/5 text-white/50 hover:bg-white/10",
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

                      <div
                        className={cn(
                          "pt-6 border-t",
                          isLight ? "border-rose-200/70" : "border-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-4",
                            isLight
                              ? "border-rose-200/80 bg-white/70"
                              : "border-white/10 bg-white/5",
                          )}
                        >
                          <div className="space-y-0.5">
                            <Label
                              className={cn(
                                "text-base",
                                isLight ? "text-slate-900" : "text-white",
                              )}
                            >
                              Arabic Content & RTL
                            </Label>
                            <p
                              className={cn(
                                "text-sm",
                                isLight ? "text-slate-600" : "text-white/50",
                              )}
                            >
                              Optimize the UI for Arabic reading and
                              Right-to-Left layout.
                            </p>
                          </div>
                          <Switch
                            checked={document.dir === "rtl"}
                            onCheckedChange={(checked) => {
                              document.dir = checked ? "rtl" : "ltr";
                              // In a real app, we'd persist this to user settings or localStorage
                              toast.info(
                                `Layout switched to ${checked ? "Right-to-Left" : "Left-to-Right"}`,
                              );
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
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-4 transition-colors",
                          isLight
                            ? "border-rose-200/80 bg-white/70 hover:bg-white"
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                      >
                        <div className="space-y-0.5">
                          <Label
                            className={cn(
                              "text-base",
                              isLight ? "text-slate-900" : "text-white",
                            )}
                          >
                            {item.title}
                          </Label>
                          <p
                            className={cn(
                              "text-sm",
                              isLight ? "text-slate-600" : "text-white/50",
                            )}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <Switch />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className={cn(
                        "mb-6 flex h-20 w-20 items-center justify-center rounded-full animate-pulse",
                        isLight ? "bg-white/75" : "bg-white/5",
                      )}
                    >
                      <Lock
                        className={cn(
                          "h-10 w-10",
                          isLight ? "text-slate-400" : "text-white/30",
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "mb-2 text-xl font-bold",
                        isLight ? "text-slate-900" : "text-white",
                      )}
                    >
                      Privacy Center
                    </h3>
                    <p
                      className={cn(
                        "max-w-md",
                        isLight ? "text-slate-600" : "text-white/50",
                      )}
                    >
                      We are working on advanced privacy controls. For now, rest
                      assured your data is encrypted and private by default.
                    </p>
                  </div>
                )}

                {activeTab === "education" && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    {/* User Role & Goals */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-lg font-bold flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Onboarding Role
                        </Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: "student", label: "Student", desc: "Coursework & exams" },
                            { id: "teacher", label: "Teacher", desc: "Prep & resources" },
                            { id: "professional", label: "Professional", desc: "Self-learning" },
                          ].map((role) => (
                            <button
                              key={role.id}
                              onClick={() => setUserRole(role.id)}
                              className={cn(
                                "p-4 rounded-xl border text-left transition-all",
                                userRole === role.id
                                  ? "border-primary bg-primary/10"
                                  : isLight ? "border-border bg-white" : "border-white/10 bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <div className="font-bold">{role.label}</div>
                              <div className="text-xs opacity-60">{role.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-lg font-bold flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Study Goals
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Ace my exams",
                            "Review faster",
                            "Stay organized",
                            "Build stronger notes",
                            "Find weak spots",
                            "Learn with my school",
                          ].map((goal) => {
                            const isSelected = goals.includes(goal);
                            return (
                              <button
                                key={goal}
                                onClick={() => {
                                  setGoals(prev => 
                                    isSelected 
                                      ? prev.filter(g => g !== goal) 
                                      : [...prev, goal]
                                  );
                                }}
                                className={cn(
                                  "p-3 rounded-lg border text-sm text-center transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : isLight ? "border-border bg-white" : "border-white/10 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                {goal}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* School & Grade */}
                    <div className="space-y-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-lg font-bold flex items-center gap-2">
                            <School className="h-5 w-5 text-primary" />
                            School & Grade
                          </Label>
                          <div className="grid gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs opacity-60">School</Label>
                              <select
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                className={cn(
                                  "w-full h-11 px-3 rounded-xl border appearance-none outline-none focus:ring-2 focus:ring-primary/20",
                                  isLight ? "bg-white border-border" : "bg-white/5 border-white/10 text-white"
                                )}
                              >
                                <option value="">Independent / Not listed</option>
                                {COUNTRIES[country]?.schools.map((s) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs opacity-60">Grade Level</Label>
                              <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value)}
                                className={cn(
                                  "w-full h-11 px-3 rounded-xl border appearance-none outline-none focus:ring-2 focus:ring-primary/20",
                                  isLight ? "bg-white border-border" : "bg-white/5 border-white/10 text-white"
                                )}
                              >
                                {GRADE_LEVELS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-lg font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Study Pace
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: "light", label: "Light", desc: "Short sessions" },
                              { id: "balanced", label: "Balanced", desc: "Steady progress" },
                              { id: "intensive", label: "Intensive", desc: "High pressure" },
                            ].map((pace) => (
                              <button
                                key={pace.id}
                                onClick={() => setStudyPace(pace.id as any)}
                                className={cn(
                                  "p-3 rounded-xl border text-left transition-all",
                                  studyPace === pace.id
                                    ? "border-primary bg-primary/10"
                                    : isLight ? "border-border bg-white" : "border-white/10 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <span className="font-bold">{pace.label}</span>
                                <span className="ml-2 text-xs opacity-60">{pace.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* School Network Opt-in */}
                    <div className="space-y-6 pt-6 border-t border-border">
                       <div className={cn(
                         "p-6 rounded-2xl border",
                         isLight ? "bg-blue-50/50 border-blue-100" : "bg-white/5 border-white/10"
                       )}>
                         <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-lg font-bold">
                                <Users2 className="h-5 w-5 text-blue-500" />
                                School Network Presence
                              </div>
                              <p className="text-sm opacity-60 max-w-lg">
                                Enable this to connect with classmates, share study assets automatically within your school feed, and appear on school leaderboards.
                              </p>
                            </div>
                            <Switch 
                              checked={schoolNetworkOptIn} 
                              onCheckedChange={setSchoolNetworkOptIn} 
                              disabled={!schoolId}
                            />
                         </div>

                         {schoolNetworkOptIn && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             className="mt-6 pt-6 border-t border-blue-200/20 space-y-4"
                           >
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label className="text-base font-medium">Discoverable in School</Label>
                                  <p className="text-xs opacity-60">Allow classmates to find your profile via search</p>
                                </div>
                                <Switch checked={discoverableInSchool} onCheckedChange={setDiscoverableInSchool} />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base font-medium">Public Profile Visibility</Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {["private", "school", "public"].map((v) => (
                                    <button
                                      key={v}
                                      onClick={() => setProfileVisibility(v as any)}
                                      className={cn(
                                        "p-2 rounded-lg border text-xs capitalize transition-all",
                                        profileVisibility === v
                                          ? "border-primary bg-primary/10"
                                          : isLight ? "border-border bg-white" : "border-white/10 bg-white/5"
                                      )}
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>
                           </motion.div>
                         )}
                         {!schoolId && (
                           <p className="mt-4 text-xs text-red-500/70 italic">Select a school above to enable network features.</p>
                         )}
                       </div>
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
                    >
                      {isLoading ? "Saving..." : "Save Education Preferences"}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
