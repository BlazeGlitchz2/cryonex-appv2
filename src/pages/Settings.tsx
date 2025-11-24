import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  LogOut, 
  Camera
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <div className="flex-1 h-full overflow-hidden relative bg-[#020005] text-white">
       {/* Cosmic Background */}
       <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.1),_transparent_70%)]" />
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 h-full flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 lg:w-72 border-r border-white/10 bg-white/[0.02] p-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Settings</h1>
          
          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-lg shadow-purple-500/5 border border-white/5" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-purple-400" : ""}`} />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Public Profile</h2>
                      <p className="text-white/50">Manage how you appear to others on Cryonex.</p>
                    </div>

                    <div className="flex items-start gap-8">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-2 border-white/10 shadow-2xl">
                          <AvatarImage src={user?.image} />
                          <AvatarFallback className="bg-purple-600 text-xl">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-black shadow-lg hover:scale-110 transition-transform">
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Display Name</Label>
                          <Input 
                            id="name" 
                            defaultValue={user?.name} 
                            className="bg-white/5 border-white/10 h-11"
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="username">Username</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">@</span>
                            <Input 
                              id="username" 
                              defaultValue={user?.email?.split('@')[0]} 
                              className="bg-white/5 border-white/10 h-11 pl-7"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Tell us about yourself..." 
                            className="bg-white/5 border-white/10 min-h-[120px]"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="flex justify-end gap-4">
                          {isEditing ? (
                            <>
                              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                              <Button className="bg-white text-black hover:bg-white/90">Save Changes</Button>
                            </>
                          ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-white/10 hover:bg-white/5">
                              Edit Profile
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                      <p className="text-white/50">Manage your email and security preferences.</p>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Address</h3>
                          <p className="text-sm text-white/50 mt-1">{user?.email}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">Change</Button>
                      </div>
                      
                      <div className="h-px bg-white/10" />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-sm text-white/50 mt-1">Last changed 3 months ago</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">Update</Button>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                      <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-400/60 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                      <p className="text-white/50">Choose what you want to be notified about.</p>
                    </div>
                    
                    <div className="space-y-6">
                      {[
                        "Daily study reminders",
                        "New follower notifications",
                        "Project updates",
                        "Product announcements"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <Label htmlFor={`notif-${i}`} className="font-medium cursor-pointer flex-1">{item}</Label>
                          <Switch id={`notif-${i}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
