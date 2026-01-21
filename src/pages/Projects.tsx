import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight, MoreHorizontal, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { useThemeStore } from "@/lib/stores/theme-store";
import { IconProjects, IconFolder, IconGrid, IconList } from "@/components/ui/icons/Web3Icons";

export default function ProjectsPage() {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#8b5cf6",
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
    <div className="flex-1 h-full overflow-hidden relative bg-transparent">
      {/* Global Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1600px] mx-auto space-y-10 pb-20"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <IconProjects className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Projects</h1>
                <p className="text-white/50 text-lg">Manage your projects and research.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/5 flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={`h-10 w-10 rounded-lg ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>
                  <IconGrid className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={`h-10 w-10 rounded-lg ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}>
                  <IconList className="h-5 w-5" />
                </Button>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] border-0 transition-all hover:scale-105">
                    <Plus className="h-5 w-5 mr-2" /> New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-[500px] p-6 rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Create Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Project Name</label>
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="e.g., Project Orion"
                        className="bg-black/40 border-white/10 text-white focus:border-purple-500/50 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Description</label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Briefly describe your project..."
                        className="bg-black/40 border-white/10 text-white focus:border-purple-500/50 min-h-[120px] rounded-xl resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Color</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Input
                            type="color"
                            value={newProject.color}
                            onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                            className="h-12 w-12 p-1 cursor-pointer bg-transparent border-white/10 rounded-xl overflow-hidden"
                          />
                        </div>
                        <div className="flex-1 h-12 rounded-xl border border-white/10 flex items-center px-4 text-sm font-mono text-white/50 bg-white/5">
                          {newProject.color.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleCreate} className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base shadow-lg shadow-purple-500/20">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Projects Grid */}
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {projects?.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div
                  onClick={() => navigate(`/app?project=${project._id}`)}
                  className={`group relative rounded-[2rem] bg-black/20 backdrop-blur-xl border border-white/5 hover:border-white/20 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] ${viewMode === "list" ? "flex items-center p-4 gap-6 h-24" : "h-[280px] flex flex-col p-8"}`}
                >
                  {/* Hover Gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom right, ${project.color}, transparent)` }}
                  />

                  {/* Icon */}
                  <div
                    className={`rounded-2xl flex items-center justify-center shadow-inner border border-white/5 transition-transform group-hover:scale-110 duration-500 ${viewMode === "list" ? "h-12 w-12 shrink-0" : "h-14 w-14 mb-6"}`}
                    style={{ backgroundColor: `${project.color}15`, color: project.color }}
                  >
                    <IconFolder className={viewMode === "list" ? "h-6 w-6" : "h-7 w-7"} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-purple-300 transition-colors">{project.name}</h3>
                      {viewMode === "grid" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 rounded-full hover:bg-white/10 text-white/30 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
                      {project.description || "No description set."}
                    </p>
                  </div>

                  {/* Footer (Grid Only) */}
                  {viewMode === "grid" && (
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center text-xs text-white/30">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {formatDistanceToNow(project._creationTime)} ago
                      </div>
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  )}

                  {/* Footer (List Only) */}
                  {viewMode === "list" && (
                    <div className="flex items-center gap-4 text-xs text-white/30 shrink-0">
                      <span>{formatDistanceToNow(project._creationTime)} ago</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
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
              className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse border border-white/5">
                <IconProjects className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No active projects</h3>
              <p className="text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
                Create a new project to organize your research and assets.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-white/90 font-bold shadow-lg shadow-white/5"
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

import { ChevronRight } from "lucide-react";