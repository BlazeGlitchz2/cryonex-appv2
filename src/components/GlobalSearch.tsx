import React, { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
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
} from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export const GlobalSearch = React.memo(function GlobalSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isGlobalSearchOpen, setGlobalSearchOpen, toggleGlobalSearch } =
    useUIStore();

  const debouncedQuery = useDebounce(query, 300);
  const searchResults = useQuery(api.globalSearch.search, {
    query: debouncedQuery,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
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
    <CommandDialog open={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <CommandInput
        placeholder="Search chats, projects, study materials..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center py-6 text-center">
            <Search className="h-8 w-8 text-white/10 mb-3" />
            <p className="text-sm text-white/40">No results found</p>
            <p className="text-xs text-white/20 mt-1">
              Try a different search term
            </p>
          </div>
        </CommandEmpty>

        {searchResults?.results && searchResults.results.length > 0 && (
          <CommandGroup heading="Results">
            {searchResults.results.map((result: any) => (
              <CommandItem
                key={`${result.type}-${result.id}`}
                onSelect={() => handleSelect(result.url)}
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

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect("/app")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
            <span className="ml-auto text-[10px] text-white/20 font-mono">
              ⌘N
            </span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/projects")}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/vault")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Library
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/study/dashboard")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Study Hub
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
});
