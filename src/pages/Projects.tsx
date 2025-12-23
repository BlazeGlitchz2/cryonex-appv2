import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FolderKanban, Star, Calendar, ArrowRight, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";

import { useThemeStore } from "@/lib/stores/theme-store";

export default function ProjectsPage() {
  const { theme } = useThemeStore();
  const isLiquid = theme === 'liquid';
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#8b5cf6", // Default purple
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
      setNewProject({ name: "", description: "", color: "#8b5cf6" });
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <div className={`flex-1 h-full overflow-hidden relative ${isLiquid ? 'bg-transparent' : 'bg-[#030304]'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-10 pb-20"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Projects</h1>
              <p className="text-white/50 text-lg max-w-lg">Manage your creative endeavors, research, and tasks in one unified workspace.</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus className="h-5 w-5 mr-2" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className={`${isLiquid ? 'glass-panel border-white/20' : 'glass-modal border-white/10'} sm:max-w-[500px] p-6`}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">Create Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Project Name</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      placeholder="e.g., Quantum Physics Research"
                      className="glass-input text-white focus:border-primary/50 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      placeholder="Briefly describe your goals..."
                      className="glass-input text-white focus:border-primary/50 min-h-[120px] rounded-xl resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Theme Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Input
                          type="color"
                          value={newProject.color}
                          onChange={(e) =>
                            setNewProject({ ...newProject, color: e.target.value })
                          }
                          className="h-12 w-12 p-1 cursor-pointer bg-transparent border-white/10 rounded-xl overflow-hidden"
                        />
                      </div>
                      <div className="flex-1 h-12 rounded-xl border border-white/10 flex items-center px-4 text-sm font-mono text-white/50 bg-white/5">
                        {newProject.color.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-lg shadow-primary/20">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div
                  onClick={() => navigate(`/app?project=${project._id}`)}
                  className="group relative h-[280px] rounded-3xl glass-card border-white/5 hover:border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5"
                >
                  {/* Hover Gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom right, ${project.color}, transparent)` }}
                  />

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-white/50 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-8 flex flex-col h-full relative z-10">
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 transition-transform group-hover:scale-110 duration-500"
                      style={{ backgroundColor: `${project.color}15`, color: project.color }}
                    >
                      <FolderKanban className="h-7 w-7" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-white/50 text-sm line-clamp-2 mb-auto leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center text-xs text-white/30">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDistanceToNow(project._creationTime)} ago
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {projects?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 animate-pulse border border-white/5">
                <FolderKanban className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No projects yet</h3>
              <p className="text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                Projects help you organize your chats, generations, and study materials. Create one to get started.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-semibold shadow-lg shadow-white/5"
              >
                Create Project
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}