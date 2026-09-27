import { Link } from "react-router";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderKanban,
  Lightbulb,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const starters = [
  {
    icon: Lightbulb,
    title: "Explain a concept",
    description: "Break down a tricky concept",
    prompt:
      "Help me understand a difficult topic. Ask me what I'm learning, then explain it clearly with an everyday example and a quick check of my understanding.",
  },
  {
    icon: FileText,
    title: "Find the key ideas",
    description: "Turn notes into a clear summary",
    prompt:
      "I want to turn my notes into a clear summary. Ask me to share my material, then help me find the main ideas, important terms, and connections.",
  },
  {
    icon: ListChecks,
    title: "Build a study plan",
    description: "Plan your next session",
    prompt:
      "Help me plan a focused study session. Ask about my subject, upcoming deadline, and available time, then build a realistic plan with breaks and active recall.",
  },
  {
    icon: Sparkles,
    title: "Explore an idea",
    description: "Develop a question or project",
    prompt:
      "Be my brainstorming partner. Ask me about the idea I'm working on, then help me explore possibilities and choose a practical next step.",
  },
];

export function WelcomeWorkspace({
  project,
  onSend,
}: {
  project: { name?: string } | null | undefined;
  onSend: (text: string) => void;
}) {
  const { user } = useAuth();
  const firstName = String(user?.name || "")
    .trim()
    .split(" ")[0];
  return (
    <section className="cx-chat-intro" aria-label="Start a conversation">
      <h1>
        {project
          ? project.name
          : firstName
            ? `Welcome back, ${firstName}.`
            : "How can I help you today?"}
      </h1>
      <p>
        {project
          ? "Your project's context, ideas, and conversations, together. Ask a question or explore what comes next."
          : "Ask a question, work through a topic, or bring in your notes."}
      </p>
      <div className="cx-prompt-grid">
        {starters.map((starter) => (
          <button
            key={starter.title}
            className="cx-prompt-card"
            onClick={() => onSend(starter.prompt)}
          >
            <span className="cx-prompt-icon">
              <starter.icon />
            </span>
            <strong>{starter.title}</strong>
            <small>{starter.description}</small>
          </button>
        ))}
      </div>
      <div className="cx-chat-shortcuts">
        <Link to="/study/dashboard">
          <BookOpen /> Open your study space <ArrowUpRight />
        </Link>
        <Link to="/projects">
          <FolderKanban /> Continue a project <ArrowUpRight />
        </Link>
      </div>
    </section>
  );
}
