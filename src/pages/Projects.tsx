import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, MoreHorizontal, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";
import {
  IconProjects,
  IconFolder,
  IconGrid,
  IconList,
} from "@/components/ui/icons/Web3Icons";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default function ProjectsPage() {
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const isLight = resolvedMode === "light";
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#06b6d4",
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
      setNewProject({ name: "", description: "", color: "#06b6d4" });
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden relative bg-transparent">
      {/* Global Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            "absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full blur-[120px]",
            isLight ? "bg-cyan-300/18" : "bg-cyan-900/10",
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full blur-[100px]",
            isLight ? "bg-indigo-300/18" : "bg-indigo-900/10",
          )}
        />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1600px] mx-auto space-y-10 pb-20"
        >
          <OnboardingTour
            tourId="projects-page"
            steps={[
              {
                targetId: "project-create-btn",
                title: "Create Project",
                description:
                  "Start a new project to organize your chats, generations, and notes.",
                position: "bottom",
              },
              {
                targetId: "project-view-toggle",
                title: "View Options",
                description:
                  "Switch between grid and list views to suit your preference.",
                position: "left",
              },
            ]}
          />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <IconProjects className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1
                  className={cn(
                    "text-4xl font-bold tracking-tight",
                    isLight ? "text-slate-900" : "text-white",
                  )}
                >
                  Projects
                </h1>
                <p
                  className={cn(
                    "text-lg",
                    isLight ? "text-slate-600" : "text-white/50",
                  )}
                >
                  Manage your projects and research.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                id="project-view-toggle"
                className={cn(
                  "p-1 rounded-xl border backdrop-blur-md flex gap-1",
                  isLight
                    ? "bg-white/65 border-primary/10"
                    : "bg-black/20 border-white/5",
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    viewMode === "grid"
                      ? isLight
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-white"
                      : isLight
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-white/40 hover:text-white",
                  )}
                >
                  <IconGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    viewMode === "list"
                      ? isLight
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-white"
                      : isLight
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-white/40 hover:text-white",
                  )}
                >
                  <IconList className="h-5 w-5" />
                </Button>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    id="project-create-btn"
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-primary/20 border-0 transition-all hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" /> New Project
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={cn(
                    "backdrop-blur-xl sm:max-w-[500px] p-6 rounded-[2rem]",
                    isLight
                      ? "bg-white/95 border-primary/10 text-slate-900"
                      : "bg-[#0A0A0B]/95 border-white/10 text-white",
                  )}
                >
                  <DialogHeader>
                    <DialogTitle
                      className={cn(
                        "text-2xl font-bold",
                        isLight ? "text-slate-900" : "text-white",
                      )}
                    >
                      Create Project
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label
                        className={cn(
                          "text-sm font-medium",
                          isLight ? "text-slate-600" : "text-white/70",
                        )}
                      >
                        Project Name
                      </label>
                      <Input
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                        placeholder="e.g., Project Orion"
                        className={cn(
                          "focus:border-primary/50 h-12 rounded-xl",
                          isLight
                            ? "bg-white border-primary/10 text-slate-900"
                            : "bg-black/40 border-white/10 text-white",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className={cn(
                          "text-sm font-medium",
                          isLight ? "text-slate-600" : "text-white/70",
                        )}
                      >
                        Description
                      </label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        placeholder="Briefly describe your project..."
                        className={cn(
                          "focus:border-primary/50 min-h-[120px] rounded-xl resize-none",
                          isLight
                            ? "bg-white border-primary/10 text-slate-900"
                            : "bg-black/40 border-white/10 text-white",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className={cn(
                          "text-sm font-medium",
                          isLight ? "text-slate-600" : "text-white/70",
                        )}
                      >
                        Color
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Input
                            type="color"
                            value={newProject.color}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                color: e.target.value,
                              })
                            }
                            className={cn(
                              "h-12 w-12 p-1 cursor-pointer bg-transparent rounded-xl overflow-hidden",
                              isLight ? "border-primary/10" : "border-white/10",
                            )}
                          />
                        </div>
                        <div
                          className={cn(
                            "flex-1 h-12 rounded-xl border flex items-center px-4 text-sm font-mono",
                            isLight
                              ? "border-primary/10 text-slate-600 bg-white/70"
                              : "border-white/10 text-white/50 bg-white/5",
                          )}
                        >
                          {newProject.color.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreate}
                      className="w-full h-12 rounded-xl bg-primary hover:opacity-90 text-white font-bold text-base shadow-lg shadow-primary/20"
                    >
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Projects Grid */}
          {projects === undefined ? (
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-[2rem] border overflow-hidden animate-pulse",
                    isLight ? "bg-white/45 border-primary/10" : "bg-black/20 border-white/5",
                    viewMode === "list"
                      ? "flex items-center p-4 gap-6 h-24"
                      : "h-[280px] flex flex-col p-8",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl",
                      isLight ? "bg-white/70" : "bg-white/5",
                      viewMode === "list" ? "h-12 w-12 shrink-0" : "h-14 w-14 mb-6",
                    )}
                  />
                  <div className="flex-1 space-y-3">
                    <div className={cn("h-5 w-2/3 rounded-lg", isLight ? "bg-white/70" : "bg-white/5")} />
                    <div className={cn("h-3 w-full rounded-lg", isLight ? "bg-white/70" : "bg-white/5")} />
                    <div className={cn("h-3 w-1/2 rounded-lg", isLight ? "bg-white/70" : "bg-white/5")} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
            >
              <AnimatePresence>
                {projects?.map((project, index) => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div
                      onClick={() => navigate(`/app?project=${project._id}`)}
                      className={cn(
                        "group relative rounded-[2rem] backdrop-blur-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]",
                        isLight
                          ? "bg-white/50 border-primary/10 hover:border-cyan-500/30"
                          : "bg-black/20 border-white/5 hover:border-white/20",
                        viewMode === "list"
                          ? "flex items-center p-4 gap-6 h-24"
                          : "h-[280px] flex flex-col p-8",
                      )}
                    >
                      {/* Hover Gradient */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `linear-gradient(to bottom right, ${project.color}, transparent)`,
                        }}
                      />

                      {/* Icon */}
                      <div
                        className={cn(
                          "rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500",
                          isLight ? "border border-primary/10" : "border border-white/5",
                          viewMode === "list" ? "h-12 w-12 shrink-0" : "h-14 w-14 mb-6",
                        )}
                        style={{
                          backgroundColor: `${project.color}15`,
                          color: project.color,
                        }}
                      >
                        <IconFolder
                          className={viewMode === "list" ? "h-6 w-6" : "h-7 w-7"}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex justify-between items-start">
                          <h3
                            className={cn(
                              "text-xl font-bold mb-2 truncate transition-colors",
                              isLight
                                ? "text-slate-900 group-hover:text-primary"
                                : "text-white group-hover:text-cyan-300",
                            )}
                          >
                            {project.name}
                          </h3>
                          {viewMode === "grid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 -mt-2 -mr-2 rounded-full",
                                isLight
                                  ? "hover:bg-white text-slate-500 hover:text-slate-900"
                                  : "hover:bg-white/10 text-white/30 hover:text-white",
                              )}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm line-clamp-2 leading-relaxed",
                            isLight ? "text-slate-600" : "text-white/50",
                          )}
                        >
                          {project.description || "No description set."}
                        </p>
                      </div>

                      {/* Footer (Grid Only) */}
                      {viewMode === "grid" && (
                        <div
                          className={cn(
                            "mt-auto pt-6 border-t flex items-center justify-between relative z-10",
                            isLight ? "border-primary/10" : "border-white/5",
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center text-xs",
                              isLight ? "text-slate-500" : "text-white/30",
                            )}
                          >
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {formatDistanceToNow(project._creationTime)} ago
                          </div>
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                              isLight
                                ? "bg-white/80 text-slate-500 group-hover:bg-blue-500 group-hover:text-white"
                                : "bg-white/5 text-white/30 group-hover:bg-blue-500 group-hover:text-white",
                            )}
                          >
                            <ArrowRight className="h-4 w-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                          </div>
                        </div>
                      )}

                      {/* Footer (List Only) */}
                      {viewMode === "list" && (
                        <div
                          className={cn(
                            "flex items-center gap-4 text-xs shrink-0",
                            isLight ? "text-slate-500" : "text-white/30",
                          )}
                        >
                          <span>
                            {formatDistanceToNow(project._creationTime)} ago
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {projects?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-[3rem]",
                isLight
                  ? "border-primary/10 bg-white/35"
                  : "border-white/10 bg-white/[0.02]",
              )}
            >
              <div
                className={cn(
                  "w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse border",
                  isLight ? "bg-white/70 border-primary/10" : "bg-white/5 border-white/5",
                )}
              >
                <IconProjects
                  className={cn(
                    "h-10 w-10",
                    isLight ? "text-slate-300" : "text-white/20",
                  )}
                />
              </div>
              <h3
                className={cn(
                  "text-2xl font-bold mb-3",
                  isLight ? "text-slate-900" : "text-white",
                )}
              >
                No active projects
              </h3>
              <p
                className={cn(
                  "max-w-md mx-auto mb-8 leading-relaxed",
                  isLight ? "text-slate-600" : "text-white/40",
                )}
              >
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
