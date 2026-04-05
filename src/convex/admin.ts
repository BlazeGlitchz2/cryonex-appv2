import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentUser } from "./users";

// Admin email whitelist - only these users can access admin features
const ADMIN_EMAILS = ["viralcentral092@gmail.com", "ratrampage324@gmail.com"];

// Helper to check if current user is admin
async function requireAdmin(ctx: any) {
  let userId = await getAuthUserId(ctx);
  let user = userId ? await ctx.db.get(userId) : null;

  if (!user) {
    user = await getCurrentUser(ctx as any);
    userId = user?._id ?? null;
  }

  if (!userId || !user) throw new Error("Not authenticated");

  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { userId, user };
}

// ==================== QUERIES ====================

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    let userId = await getAuthUserId(ctx);
    let user = userId ? await ctx.db.get(userId) : null;

    if (!user) {
      user = await getCurrentUser(ctx as any);
      userId = user?._id ?? null;
    }

    if (!userId || !user) return false;

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
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const studySessions = await ctx.db.query("studySessions").collect();
    const activityEvents = await ctx.db.query("activityEvents").collect();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentActivityEvents = activityEvents.filter(
      (event) => event.createdAt >= sevenDaysAgo,
    );
    const recentStudySessions = studySessions.filter(
      (session) => session.startTime >= sevenDaysAgo,
    );

    return {
      totalUsers: users.length,
      totalChats: chats.length,
      totalMessages: messages.length,
      activeSessions: sessions.length,
      totalStudySessions: studySessions.length,
      totalActivityEvents: activityEvents.length,
      recentActivityEvents: recentActivityEvents.length,
      recentStudySessions: recentStudySessions.length,
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

export const getActivityFeed = query({
  args: {
    limit: v.optional(v.number()),
    source: v.optional(v.string()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let events = await ctx.db
      .query("activityEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(args.limit || 100);

    if (args.source) {
      events = events.filter((event) => event.source === args.source);
    }

    if (args.eventType) {
      events = events.filter((event) => event.eventType === args.eventType);
    }

    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const user = await ctx.db.get(event.userId);
        return {
          ...event,
          userName: user?.name || user?.email || "Unknown",
          userEmail: user?.email,
        };
      }),
    );

    return enrichedEvents;
  },
});

export const getActivitySummary = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit || 200;
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    const studySessions = await ctx.db
      .query("studySessions")
      .withIndex("by_startTime")
      .order("desc")
      .take(limit);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sourceCounts = new Map<string, number>();
    const eventCounts = new Map<string, number>();
    const dailyActivity = new Map<string, number>();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      dailyActivity.set(dayLabels[date.getDay()], 0);
    }

    for (const event of events) {
      sourceCounts.set(
        event.source,
        (sourceCounts.get(event.source) || 0) + 1,
      );
      const actionKey = `${event.source}:${event.eventType}`;
      eventCounts.set(actionKey, (eventCounts.get(actionKey) || 0) + 1);
      if (event.createdAt >= sevenDaysAgo) {
        const dayName = dayLabels[new Date(event.createdAt).getDay()];
        if (dailyActivity.has(dayName)) {
          dailyActivity.set(dayName, (dailyActivity.get(dayName) || 0) + 1);
        }
      }
    }

    const topActions = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => {
        const [source, eventType] = key.split(":");
        return { source, eventType, count };
      });

    const recentEvents = await Promise.all(
      events.slice(0, 24).map(async (event) => {
        const user = await ctx.db.get(event.userId);
        return {
          ...event,
          userName: user?.name || user?.email || "Unknown",
          userEmail: user?.email,
        };
      }),
    );

    return {
      recentEvents,
      topActions,
      sourceCounts: Array.from(sourceCounts.entries()).map(([source, count]) => ({
        source,
        count,
      })),
      dailyActivity: Array.from(dailyActivity.entries()).map(([name, count]) => ({
        name,
        count,
      })),
      studySessionCount: studySessions.length,
      recentStudySessions: studySessions.slice(0, 24),
    };
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

export const logActivityEvent = mutation({
  args: {
    source: v.string(),
    eventType: v.string(),
    section: v.optional(v.string()),
    title: v.optional(v.string()),
    platform: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);
    return await ctx.db.insert("activityEvents", {
      userId,
      source: args.source,
      eventType: args.eventType,
      section: args.section,
      title: args.title,
      platform: args.platform,
      deviceType: args.deviceType,
      details: args.details,
      createdAt: Date.now(),
    });
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
