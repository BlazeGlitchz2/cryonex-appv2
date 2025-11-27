import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FolderKanban, Star } from "lucide-react";
import { toast } from "sonner";
import SpaceBackground from "@/components/SpaceBackground";

export default function ProjectsPage() {
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
    <div className="flex-1 h-full overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020005]">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%)]" />
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0f0529] to-transparent opacity-40" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
          >
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your Projects</h1>
              <p className="text-white/50 text-lg">Organize your work into cosmic boards</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-black hover:bg-white/90 rounded-full h-10 px-5 font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Name</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      placeholder="My Awesome Project"
                      className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      placeholder="What are you building?"
                      className="bg-white/5 border-white/10 text-white focus:border-primary/50 min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Color Code</label>
                    <div className="flex items-center gap-3">
                       <Input
                        type="color"
                        value={newProject.color}
                        onChange={(e) =>
                          setNewProject({ ...newProject, color: e.target.value })
                        }
                        className="h-10 w-14 p-1 cursor-pointer bg-transparent border-white/10"
                      />
                      <span className="text-xs text-white/30 font-mono">{newProject.color}</span>
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer bg-white/5 backdrop-blur-md border-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 h-full">
                  <CardHeader className="relative">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                      >
                        <FolderKanban className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <CardTitle className="text-lg font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-white/40 mt-1">
                          {project.description || "No description provided."}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className="h-4 w-4 text-white/20 hover:text-yellow-400 transition-colors" />
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {projects?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                 <FolderKanban className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-6">Start by creating a project to organize your tasks, files, and AI conversations.</p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="border-white/10 hover:bg-white/5">
                Create your first project
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}