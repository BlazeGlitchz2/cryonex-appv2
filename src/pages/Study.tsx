import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

export default function Study() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Sync with global theme
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || !savedTheme;
    setIsDarkMode(isDark);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className={`fixed inset-0 -z-10 transition-all duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
            : "bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900"
        }`}
      />
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_40px_rgba(0,0,0,0.25)] z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Brand & Back */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app")}
              className="text-white hover:bg-white/10 rounded-lg gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Study</span>
            </div>
          </div>

          {/* Right: User */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-white hidden lg:inline">{user.email?.split('@')[0]}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <StudyUploadZone />
        </div>
      </div>
    </div>
  );
}