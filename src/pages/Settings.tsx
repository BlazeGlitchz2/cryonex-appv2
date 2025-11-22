import { useThemeStore } from "@/lib/stores/theme-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Palette } from "lucide-react";

export default function SettingsPage() {
  const { theme, mode, setTheme, toggleMode } = useThemeStore();

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and application settings.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks and feels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme Mode</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color mode</p>
              </div>
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={mode === 'light' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => mode !== 'light' && toggleMode()}
                  className="gap-2"
                >
                  <Sun className="h-4 w-4" /> Light
                </Button>
                <Button
                  variant={mode === 'dark' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => mode !== 'dark' && toggleMode()}
                  className="gap-2"
                >
                  <Moon className="h-4 w-4" /> Dark
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Visual Theme</Label>
                <p className="text-sm text-muted-foreground">Choose a visual style for the background</p>
              </div>
              <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosmic">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-purple-500" /> Cosmic
                    </div>
                  </SelectItem>
                  <SelectItem value="liquid">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-500" /> Liquid
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your general preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Performance Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce animations for better performance</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
