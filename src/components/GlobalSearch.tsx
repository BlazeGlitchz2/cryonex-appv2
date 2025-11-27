import { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { MessageSquare, BookOpen, FolderKanban, Sparkles, Search } from "lucide-react";

import { useUIStore } from "@/lib/stores/ui-store";

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { isGlobalSearchOpen, setGlobalSearchOpen, toggleGlobalSearch } = useUIStore();

    // Debounce query could be added here, but for now direct binding
    const searchResults = useQuery(api.globalSearch.search, { query });

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

    const handleSelect = (url: string) => {
        navigate(url);
        setGlobalSearchOpen(false);
    };

    return (
        <CommandDialog open={isGlobalSearchOpen} onOpenChange={setGlobalSearchOpen}>
            <CommandInput placeholder="Type a command or search..." value={query} onValueChange={setQuery} />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {searchResults?.results && searchResults.results.length > 0 && (
                    <CommandGroup heading="Results">
                        {searchResults.results.map((result: any) => (
                            <CommandItem key={`${result.type}-${result.id}`} onSelect={() => handleSelect(result.url)}>
                                {result.type === "chat" && <MessageSquare className="mr-2 h-4 w-4" />}
                                {result.type === "library" && <Sparkles className="mr-2 h-4 w-4" />}
                                {result.type === "project" && <FolderKanban className="mr-2 h-4 w-4" />}
                                {result.type === "study" && <BookOpen className="mr-2 h-4 w-4" />}
                                <span>{result.title}</span>
                                <span className="ml-auto text-xs text-muted-foreground capitalize">{result.type}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => handleSelect("/app")}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        New Chat
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/projects")}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Projects
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect("/library")}>
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
}
