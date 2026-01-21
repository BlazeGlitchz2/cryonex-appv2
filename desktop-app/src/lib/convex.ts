import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
    console.warn("VITE_CONVEX_URL is not set. Using placeholder.");
}

export const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

// Mock API object for type safety until codegen
export const api: any = {
    chats: {
        list: "chats:list",
        create: "chats:create",
        deleteChat: "chats:deleteChat",
    },
    messages: {
        list: "messages:list",
        create: "messages:create",
    },
    chat: {
        sendMessage: "chat:sendMessage",
    },
};
