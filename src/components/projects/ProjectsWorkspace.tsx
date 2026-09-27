import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  FolderKanban,
  Grid2X2,
  Lightbulb,
  List,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const colors = ["#60a5fa", "#a78bfa", "#34b897", "#e6a563", "#e879b6"];
const starters = [
  {
    icon: BookOpen,
    name: "Exam revision",
    description: "Keep your study questions and revision ideas together.",
  },
  {
    icon: FolderKanban,
    name: "Research notebook",
    description:
      "Explore sources, connect concepts, and develop your thinking.",
  },
  {
    icon: Lightbulb,
    name: "Creative ideas",
    description: "Give your next big idea a dedicated place to grow.",
  },
];

export default function ProjectsWorkspace() {
  const { user } = useAuth();
  const result = useQuery(api.projects.list, user ? {} : "skip");
  const projects = useMemo(() => (user ? result : []), [user, result]);
  const createProject = useMutation(api.projects.create);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("recent");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const filtered = useMemo(
    () =>
      (projects || [])
        .filter((project) =>
          `${project.name} ${project.description || ""}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : b._creationTime - a._creationTime,
        ),
    [projects, query, sort],
  );
  const openProject = (starter?: (typeof starters)[number]) => {
    setName(starter?.name || "");
    setDescription(starter?.description || "");
    setColor(colors[0]);
    setError("");
    setDialogOpen(true);
  };
  const handleCreate = async () => {
    if (busyRef.current) return;
    if (!name.trim()) {
      setError("Give your project a name to get started.");
      return;
    }
    if (!user) {
      setError("Sign in to save your project.");
      return;
    }
    busyRef.current = true;
    setPending(true);
    setError("");
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        color,
      });
      toast.success("Your project is ready.");
      setDialogOpen(false);
    } catch {
      setError(
        "We couldn't save this project. Your draft is here — try again.",
      );
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };
  return (
    <div className="cx-projects-page cx-collection-page h-full overflow-y-auto custom-scrollbar">
      <div className="cx-projects-container">
        <header className="cx-projects-heading">
          <div>
            <h1>Your projects</h1>
            <p>Organize conversations and research by project.</p>
          </div>
          <Button
            onClick={() => openProject()}
            id="project-create-btn"
            className="rounded-full h-11 px-5"
          >
            <Plus size={16} /> New project
          </Button>
        </header>
        <div className="cx-projects-toolbar">
          <div className="cx-projects-search">
            <Search size={16} />
            <Input
              aria-label="Search projects"
              placeholder="Find a project…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span className="cx-collection-count">
            {projects?.length ?? 0} project{projects?.length === 1 ? "" : "s"}
          </span>
          <label className="cx-project-sort">
            <span className="sr-only">Sort projects</span>
            <select
              aria-label="Sort projects"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <div className="cx-view-toggle" id="project-view-toggle">
            <button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={17} />
            </button>
          </div>
        </div>
        {projects === undefined ? (
          <div
            className="cx-project-grid"
            role="status"
            aria-label="Loading projects"
          >
            {[1, 2, 3].map((item) => (
              <div key={item} className="cx-project-card animate-pulse">
                <span className="h-10 w-10 rounded-xl bg-muted" />
                <span className="mt-6 h-4 w-2/3 rounded bg-muted" />
                <span className="mt-3 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <div
            className={`cx-project-grid ${view === "list" ? "cx-project-list" : ""}`}
          >
            {filtered.map((project) => {
              const accent = /^#[\da-f]{6}$/i.test(project.color || "")
                ? project.color
                : colors[0];
              return (
                <Link
                  to={`/app?project=${project._id}`}
                  className="cx-project-card"
                  key={project._id}
                  style={{ "--project-accent": accent } as CSSProperties}
                >
                  <span className="cx-project-card-icon">
                    <FolderKanban size={22} />
                  </span>
                  <div className="cx-project-card-copy">
                    <h2>{project.name}</h2>
                    <p>
                      {project.description ||
                        "A fresh space for your next idea."}
                    </p>
                  </div>
                  <div className="cx-project-card-footer">
                    <span>
                      <Calendar size={12} /> Created{" "}
                      {formatDistanceToNow(project._creationTime, {
                        addSuffix: true,
                      })}
                    </span>
                    <ArrowUpRight size={17} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <section className="cx-project-empty">
            <span className="cx-project-empty-icon">
              <FolderKanban size={32} />
            </span>
            <h2>
              {query.trim()
                ? "No projects match that search."
                : "No projects yet"}
            </h2>
            <p>
              {query.trim()
                ? "Try another title or a word from the description."
                : "Create a project to give your ideas, research, and conversations a shared home."}
            </p>
            <Button
              className="rounded-full h-11 px-6"
              onClick={() => (query.trim() ? setQuery("") : openProject())}
            >
              {query.trim() ? "Clear search" : "Create your first project"}
              <ArrowRight size={15} />
            </Button>
          </section>
        )}
        {!query.trim() && (
          <section className="cx-project-starters">
            <h2>Start from a template</h2>
            <div>
              {starters.map((starter) => (
                <button key={starter.name} onClick={() => openProject(starter)}>
                  <span>
                    <starter.icon size={18} />
                  </span>
                  <strong>{starter.name}</strong>
                  <p>{starter.description}</p>
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!pending) setDialogOpen(open);
        }}
      >
        <DialogContent className="rounded-[28px] border-border bg-card sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-tight">
              Create a project
            </DialogTitle>
            <DialogDescription>
              Add a name and an optional description.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5 mt-2"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreate();
            }}
          >
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Project name
              </label>
              <Input
                id="project-name"
                autoFocus
                maxLength={100}
                value={name}
                disabled={pending}
                aria-invalid={!!error}
                aria-describedby={error ? "project-create-error" : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="A subject, a goal, a big idea…"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium"
              >
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="project-description"
                maxLength={2000}
                value={description}
                disabled={pending}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you working towards?"
                rows={3}
              />
            </div>
            <fieldset>
              <legend className="text-sm font-medium mb-3">
                Make it yours
              </legend>
              <div className="flex gap-3">
                {colors.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    disabled={pending}
                    aria-label={
                      ["Blue", "Purple", "Green", "Orange", "Pink"][index]
                    }
                    aria-pressed={color === option}
                    onClick={() => setColor(option)}
                    className="h-8 w-8 rounded-full flex items-center justify-center border-2 border-transparent"
                    style={{
                      background: option,
                      outline:
                        color === option ? `2px solid ${option}` : undefined,
                      outlineOffset: 3,
                    }}
                  >
                    {color === option && (
                      <Check size={15} className="text-primary-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && (
              <p
                id="project-create-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-full px-5"
              >
                {pending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    Create project <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
