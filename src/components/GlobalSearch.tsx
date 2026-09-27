import React, { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import {
  MessageSquare,
  BookOpen,
  FolderKanban,
  Sparkles,
  Search,
  Settings,
  Plug,
  Loader2,
} from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const quickActions = [
  {
    label: "Assistant",
    url: "/app",
    icon: MessageSquare,
    keywords: "chat conversation ai",
  },
  {
    label: "Study space",
    url: "/study/dashboard",
    icon: BookOpen,
    keywords: "study hub dashboard learn",
  },
  {
    label: "Study Copilot",
    url: "/study/copilot",
    icon: Sparkles,
    keywords: "tutor help",
  },
  {
    label: "Projects",
    url: "/projects",
    icon: FolderKanban,
    keywords: "ideas research",
  },
  {
    label: "Library",
    url: "/library",
    icon: BookOpen,
    keywords: "notes saved",
  },
  {
    label: "Integrations",
    url: "/integrations",
    icon: Plug,
    keywords: "tools providers",
  },
  {
    label: "Settings and appearance",
    url: "/settings",
    icon: Settings,
    keywords: "profile theme account",
  },
];

export const GlobalSearch = React.memo(function GlobalSearch() {
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isGlobalSearchOpen, setGlobalSearchOpen, toggleGlobalSearch } =
    useUIStore();

  const debouncedQuery = useDebounce(query, 300);
  const trimmedQuery = query.trim();
  const normalizedQuery = debouncedQuery.trim();
  const searchResults = useQuery(
    api.globalSearch.search,
    user &&
      isGlobalSearchOpen &&
      trimmedQuery &&
      trimmedQuery === normalizedQuery
      ? {
          query: normalizedQuery,
        }
      : "skip",
  );
  const isSearching =
    !!user &&
    !!trimmedQuery &&
    (trimmedQuery !== normalizedQuery || searchResults === undefined);

  const matchingActions = quickActions.filter((action) =>
    `${action.label} ${action.keywords}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const results =
    trimmedQuery && !isSearching ? (searchResults?.results ?? []) : [];

  useEffect(() => {
    if (!isGlobalSearchOpen) setQuery("");
  }, [isGlobalSearchOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleGlobalSearch();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleGlobalSearch]);

  const handleSelect = useCallback(
    (url: string) => {
      navigate(url);
      setGlobalSearchOpen(false);
      setQuery("");
    },
    [navigate, setGlobalSearchOpen],
  );

  return (
    <CommandDialog
      title="Search your workspace"
      description="Find conversations, projects, and study materials or jump to a workspace section."
      shouldFilter={false}
      open={isGlobalSearchOpen}
      onOpenChange={setGlobalSearchOpen}
    >
      <CommandInput
        placeholder="Search chats, projects, study materials..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isSearching && (
          <div
            className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"
            role="status"
          >
            <Loader2 className="h-4 w-4 animate-spin" /> Searching your
            workspace…
          </div>
        )}
        {!isSearching &&
          query.trim() &&
          !results.length &&
          !matchingActions.length && (
            <div>
              <div className="flex flex-col items-center py-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-foreground">
                  {user
                    ? "No matches yet"
                    : "Sign in to search your saved work"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user
                    ? "Try a title, subject, or project name."
                    : "You can still jump to a section below."}
                </p>
              </div>
            </div>
          )}

        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={`${result.type}-${result.id}`}
                value={`${result.type}-${result.id}`}
                onSelect={() =>
                  handleSelect(
                    result.type === "chat"
                      ? `/app/chat/${result.id}`
                      : result.type === "project"
                        ? `/app?project=${result.id}`
                        : result.url,
                  )
                }
              >
                {result.type === "chat" && (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                {result.type === "library" && (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {result.type === "project" && (
                  <FolderKanban className="mr-2 h-4 w-4" />
                )}
                {result.type === "study" && (
                  <BookOpen className="mr-2 h-4 w-4" />
                )}
                <span>{result.title}</span>
                <span className="ml-auto text-xs text-muted-foreground capitalize">
                  {result.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchingActions.length > 0 && (
          <CommandGroup heading="Jump to">
            {matchingActions.map((action) => (
              <CommandItem
                key={action.url}
                value={action.url}
                onSelect={() => handleSelect(action.url)}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
});
