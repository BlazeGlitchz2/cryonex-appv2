import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * Global search across all user content
 */

export const search = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) return { results: [] };

        const searchText = args.query.toLowerCase().trim();
        if (!searchText) return { results: [] };

        // Search Chats
        const chats = await ctx.db
            .query("chats")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const matchedChats = chats
            .filter((c) => c.title.toLowerCase().includes(searchText))
            .slice(0, 5)
            .map((c) => ({ type: "chat", id: c._id, title: c.title, url: `/app?chatId=${c._id}` }));

        // Search Library
        const library = await ctx.db
            .query("libraryItems")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const matchedLibrary = library
            .filter((l) => l.title.toLowerCase().includes(searchText) || l.prompt.toLowerCase().includes(searchText))
            .slice(0, 5)
            .map((l) => ({ type: "library", id: l._id, title: l.title, url: `/library` }));

        // Search Projects
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const matchedProjects = projects
            .filter((p) => p.name.toLowerCase().includes(searchText))
            .slice(0, 5)
            .map((p) => ({ type: "project", id: p._id, title: p.name, url: `/projects` }));

        // Search Study Materials
        const studyMaterials = await ctx.db
            .query("studyMaterials")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const matchedStudy = studyMaterials
            .filter((m) => m.title.toLowerCase().includes(searchText))
            .slice(0, 5)
            .map((m) => ({ type: "study", id: m._id, title: m.title, url: `/study/workspace/${m.docId}` }));

        return {
            results: [
                ...matchedChats,
                ...matchedLibrary,
                ...matchedProjects,
                ...matchedStudy
            ]
        };
    },
});
