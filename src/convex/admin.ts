import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Admin email whitelist - only these users can access admin features
const ADMIN_EMAILS = ["viralcentral092@gmail.com", "ratrampage324@gmail.com"];

// Helper to check if current user is admin
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { userId, user };
}

// ==================== QUERIES ====================

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    return user?.email
      ? ADMIN_EMAILS.includes(user.email.toLowerCase())
      : false;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const chats = await ctx.db.query("chats").collect();
    const messages = await ctx.db.query("messages").collect();
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      totalUsers: users.length,
      totalChats: chats.length,
      totalMessages: messages.length,
      activeSessions: sessions.length,
    };
  },
});

export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let users = await ctx.db
      .query("users")
      .order("desc")
      .take(args.limit || 100);

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower),
      );
    }

    // Get message count per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const chats = await ctx.db
          .query("chats")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        let messageCount = 0;
        for (const chat of chats) {
          const msgs = await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
            .collect();
          messageCount += msgs.length;
        }

        return {
          ...user,
          chatCount: chats.length,
          messageCount,
        };
      }),
    );

    return usersWithStats;
  },
});

export const getAllMessages = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(args.limit || 200);

    if (args.userId) {
      messages = messages.filter((m) => m.userId === args.userId);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      messages = messages.filter((m) =>
        m.content.toLowerCase().includes(searchLower),
      );
    }

    // Enrich with user data
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        const chat = await ctx.db.get(msg.chatId);
        return {
          ...msg,
          userName: user?.name || user?.email || "Unknown",
          userEmail: user?.email,
          chatTitle: chat?.title || "Deleted Chat",
        };
      }),
    );

    return enrichedMessages;
  },
});

export const getAllChats = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let chats = await ctx.db
      .query("chats")
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      chats = chats.filter((c) => c.userId === args.userId);
    }

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const user = await ctx.db.get(chat.userId);
        const messageCount = (
          await ctx.db
            .query("messages")
            .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
            .collect()
        ).length;

        return {
          ...chat,
          userName: user?.name || user?.email || "Unknown",
          userEmail: user?.email,
          messageCount,
        };
      }),
    );

    return enrichedChats;
  },
});

export const getAllSessions = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let sessions = await ctx.db.query("sessions").order("desc").take(500);

    if (args.activeOnly) {
      sessions = sessions.filter((s) => s.isActive);
    }

    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const user = await ctx.db.get(session.userId);
        return {
          ...session,
          userName: user?.name || user?.email || "Unknown",
          userEmail: user?.email,
        };
      }),
    );

    return enrichedSessions;
  },
});

export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 100);

    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const admin = await ctx.db.get(log.adminId);
        return {
          ...log,
          adminName: admin?.name || admin?.email || "Unknown",
          adminEmail: admin?.email,
        };
      }),
    );

    return enrichedLogs;
  },
});

// ==================== MUTATIONS ====================

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.delete(args.messageId);

    // Log the action
    await ctx.db.insert("auditLogs", {
      adminId: userId,
      action: "DELETE_MESSAGE",
      targetType: "message",
      targetId: args.messageId,
      details: {
        reason: args.reason,
        content: message.content.substring(0, 100),
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.chatId);

    // Log the action
    await ctx.db.insert("auditLogs", {
      adminId: userId,
      action: "DELETE_CHAT",
      targetType: "chat",
      targetId: args.chatId,
      details: {
        reason: args.reason,
        title: chat.title,
        messageCount: messages.length,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const terminateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, { isActive: false });

    // Log the action
    await ctx.db.insert("auditLogs", {
      adminId: userId,
      action: "TERMINATE_SESSION",
      targetType: "session",
      targetId: args.sessionId,
      details: { targetUserId: session.userId },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const banUser = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) throw new Error("User not found");

    // Don't allow banning other admins
    if (
      targetUser.email &&
      ADMIN_EMAILS.includes(targetUser.email.toLowerCase())
    ) {
      throw new Error("Cannot ban admin users");
    }

    // Set role to banned (you could also delete all their sessions)
    await ctx.db.patch(args.targetUserId, { role: "banned" as any });

    // Terminate all their sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    // Log the action
    await ctx.db.insert("auditLogs", {
      adminId: userId,
      action: "BAN_USER",
      targetType: "user",
      targetId: args.targetUserId,
      details: { reason: args.reason, userEmail: targetUser.email },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// ==================== SESSION TRACKING ====================

export const logSession = mutation({
  args: {
    deviceInfo: v.object({
      browser: v.string(),
      os: v.string(),
      device: v.string(),
      userAgent: v.optional(v.string()),
    }),
    ip: v.optional(v.string()),
    location: v.optional(
      v.object({
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        region: v.optional(v.string()),
        lat: v.optional(v.number()),
        lon: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = Date.now();

    // Check if there's an existing active session with same device
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Find matching session by device info
    const matchingSession = existingSessions.find(
      (s) =>
        s.deviceInfo.browser === args.deviceInfo.browser &&
        s.deviceInfo.os === args.deviceInfo.os &&
        s.deviceInfo.device === args.deviceInfo.device,
    );

    if (matchingSession) {
      // Update last active time
      await ctx.db.patch(matchingSession._id, { lastActiveAt: now });
      return matchingSession._id;
    }

    // Create new session
    const sessionId = await ctx.db.insert("sessions", {
      userId,
      deviceInfo: args.deviceInfo,
      ip: args.ip,
      location: args.location,
      createdAt: now,
      lastActiveAt: now,
      isActive: true,
    });

    return sessionId;
  },
});
