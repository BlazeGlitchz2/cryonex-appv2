import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FolderKanban, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const handleCreate = async () => {
    if (!newProject.name) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      await createProject(newProject);
      toast.success("Project created");
      setIsDialogOpen(false);
      setNewProject({ name: "", description: "", color: "#3b82f6" });
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900 -z-10" />
      
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
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Projects</span>
            </div>
          </div>

          {/* Right: User & New Project */}
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      placeholder="My Project"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      placeholder="Project description..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Color</label>
                    <Input
                      type="color"
                      value={newProject.color}
                      onChange={(e) =>
                        setNewProject({ ...newProject, color: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm text-white hidden lg:inline">{user.email?.split('@')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-white mb-2">Your Projects</h1>
            <p className="text-white/70">Organize your work into projects</p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:border-white/40 transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: project.color }}
                      >
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate text-white">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-white/70">
                          {project.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {projects?.length === 0 && (
            <div className="text-center py-16">
              <FolderKanban className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
              <p className="text-white/60">Create your first project to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}