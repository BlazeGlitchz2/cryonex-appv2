import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { User, Lock, Bell, Shield, Trash2, Save, Palette, Upload, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useThemeStore } from "@/lib/stores/theme-store";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteUser = useMutation(api.users.deleteUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatarStorageId = useMutation(api.files.saveAvatarStorageId);

  const { theme, setTheme, mode, toggleMode } = useThemeStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name, email });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

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
    toast.info("This setting is managed by your login provider (Google/GitHub/OTP).");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Save storage ID to user profile
      const imageUrl = await saveAvatarStorageId({ storageId });

      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="account" className="gap-2"><Shield className="h-4 w-4" /> Account</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><Lock className="h-4 w-4" /> Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="border-border hover:bg-secondary/50 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" className="bg-background/50 border-border" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/20 px-6 py-4">
              <Button onClick={handleSaveProfile} disabled={isLoading} className="ml-auto gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>Customize the look and feel of your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Theme Style</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('cosmic')}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        theme === 'cosmic'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-background/50'
                      }`}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-50" />
                      <div className="relative space-y-2">
                        <div className="text-lg font-bold">Cosmic</div>
                        <p className="text-xs text-muted-foreground">Deep space vibes with vibrant gradients</p>
                      </div>
                      {theme === 'cosmic' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setTheme('liquid')}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        theme === 'liquid'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-background/50'
                      }`}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl" />
                      <div className="relative space-y-2">
                        <div className="text-lg font-bold">Liquid Glass</div>
                        <p className="text-xs text-muted-foreground">macOS-inspired frosted glass aesthetic</p>
                      </div>
                      {theme === 'liquid' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark appearance</p>
                    </div>
                    <Switch checked={mode === 'dark'} onCheckedChange={toggleMode} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="bg-card/50 border-border backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your login credentials and security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                  <Button variant="outline" onClick={handleNotAvailable} className="shrink-0 border-border">Change Email</Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input id="password" type="password" value="********" disabled className="bg-background/50 border-border" />
                  <Button variant="outline" onClick={handleNotAvailable} className="shrink-0 border-border">Change Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your account via email.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive news and special offers.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Privacy controls are coming soon. Your data is currently private by default.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}