import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Monitor,
  Shield,
  Search,
  Trash2,
  Ban,
  LogOut,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tab = "overview" | "users" | "messages" | "sessions" | "audit";

export default function AdminPage() {
  const navigate = useNavigate();
  const isAdmin = useQuery(api.admin.isAdmin);
  const hasAdminAccess = isAdmin === true;
  const stats = useQuery(api.admin.getStats, hasAdminAccess ? {} : "skip");

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  if (isAdmin === undefined) {
    return (
      <div className="flex-1 h-full bg-[#020005] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-white/50 mx-auto" />
          <p className="text-white/50">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex-1 h-full bg-[#020005] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-white/50">
            You don't have permission to access the admin panel.
          </p>
          <Button
            onClick={() => navigate("/app")}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            Return to App
          </Button>
        </motion.div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: <Monitor className="h-4 w-4" />,
    },
    { id: "audit", label: "Audit Log", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#020005]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.1),_transparent_50%)]" />
      </div>

      <div className="h-full flex flex-col">
        <div className="shrink-0 border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-white/40">
                  Manage users, messages, and security
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-red-500/50 text-red-400 bg-red-500/10"
            >
              Admin Access
            </Badge>
          </div>

          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <OverviewTab stats={stats} />}
          {activeTab === "users" && (
            <UsersTab
              enabled={hasAdminAccess}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === "messages" && (
            <MessagesTab
              enabled={hasAdminAccess}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === "sessions" && <SessionsTab enabled={hasAdminAccess} />}
          {activeTab === "audit" && <AuditTab enabled={hasAdminAccess} />}
        </div>
      </div>

      <Dialog
        open={confirmDialog?.open || false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {confirmDialog?.title}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {confirmDialog?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialog?.action();
                setConfirmDialog(null);
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Total Chats", value: stats.totalChats, icon: MessageSquare },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
    },
    { label: "Active Sessions", value: stats.activeSessions, icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                <card.icon className="h-4 w-4" />
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {card.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab({
  enabled,
  searchQuery,
  setSearchQuery,
}: {
  enabled: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const users = useQuery(
    api.admin.getAllUsers,
    enabled
      ? {
          limit: 100,
          search: searchQuery || undefined,
        }
      : "skip",
  );
  const banUser = useMutation(api.admin.banUser);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                User
              </th>
              <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                Email
              </th>
              <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                Chats
              </th>
              <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                Messages
              </th>
              <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr
                key={user._id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0] || user.email?.[0] || "?"}
                    </div>
                    <span className="text-white font-medium">
                      {user.name || "No name"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60 text-sm">
                  {user.email || "No email"}
                </td>
                <td className="px-4 py-3 text-white">{user.chatCount}</td>
                <td className="px-4 py-3 text-white">{user.messageCount}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-white">
                      <DropdownMenuItem
                        onClick={() => {
                          const reason = prompt("Reason for ban:");
                          if (reason)
                            banUser({ targetUserId: user._id, reason })
                              .then(() => toast.success("User banned"))
                              .catch((e) => toast.error(e.message));
                        }}
                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                      >
                        <Ban className="h-4 w-4 mr-2" /> Ban User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="text-center py-8 text-white/40">No users found</div>
        )}
      </div>
    </div>
  );
}

function MessagesTab({
  enabled,
  searchQuery,
  setSearchQuery,
}: {
  enabled: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const messages = useQuery(
    api.admin.getAllMessages,
    enabled
      ? {
          limit: 200,
          search: searchQuery || undefined,
        }
      : "skip",
  );
  const deleteMessage = useMutation(api.admin.deleteMessage);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={msg.role === "user" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {msg.role}
                  </Badge>
                  <span className="text-xs text-white/40">{msg.userName}</span>
                  <span className="text-xs text-white/30">•</span>
                  <span className="text-xs text-white/40">{msg.chatTitle}</span>
                </div>
                <p className="text-white/80 text-sm line-clamp-3">
                  {msg.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm("Delete this message?"))
                    deleteMessage({ messageId: msg._id })
                      .then(() => toast.success("Message deleted"))
                      .catch((e) => toast.error(e.message));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && (
          <div className="text-center py-8 text-white/40">
            No messages found
          </div>
        )}
      </div>
    </div>
  );
}

function SessionsTab({ enabled }: { enabled: boolean }) {
  const sessions = useQuery(
    api.admin.getAllSessions,
    enabled ? { activeOnly: true } : "skip",
  );
  const terminateSession = useMutation(api.admin.terminateSession);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
              User
            </th>
            <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
              Device
            </th>
            <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
              Location
            </th>
            <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
              Last Active
            </th>
            <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sessions?.map((session) => (
            <tr
              key={session._id}
              className="border-t border-white/5 hover:bg-white/5"
            >
              <td className="px-4 py-3">
                <p className="text-white font-medium">{session.userName}</p>
                <p className="text-white/40 text-xs">{session.userEmail}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-white text-sm">
                  {session.deviceInfo.browser}
                </p>
                <p className="text-white/40 text-xs">
                  {session.deviceInfo.os} • {session.deviceInfo.device}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-white text-sm">
                  {session.location?.city || "Unknown"},{" "}
                  {session.location?.country || "Unknown"}
                </p>
                {session.ip && (
                  <p className="text-white/40 text-xs">{session.ip}</p>
                )}
              </td>
              <td className="px-4 py-3 text-white/60 text-sm">
                {new Date(session.lastActiveAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() =>
                    terminateSession({ sessionId: session._id })
                      .then(() => toast.success("Session terminated"))
                      .catch((e) => toast.error(e.message))
                  }
                >
                  <LogOut className="h-4 w-4 mr-1" /> Terminate
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!sessions || sessions.length === 0) && (
        <div className="text-center py-8 text-white/40">No active sessions</div>
      )}
    </div>
  );
}

function AuditTab({ enabled }: { enabled: boolean }) {
  const logs = useQuery(
    api.admin.getAuditLogs,
    enabled ? { limit: 100 } : "skip",
  );

  const getActionColor = (action: string) => {
    if (action.includes("DELETE")) return "text-red-400 bg-red-500/10";
    if (action.includes("BAN")) return "text-orange-400 bg-orange-500/10";
    if (action.includes("TERMINATE")) return "text-yellow-400 bg-yellow-500/10";
    return "text-blue-400 bg-blue-500/10";
  };

  return (
    <div className="space-y-2">
      {logs?.map((log) => (
        <div
          key={log._id}
          className="bg-white/5 rounded-lg border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <Badge className={getActionColor(log.action)}>{log.action}</Badge>
            <span className="text-white/60 text-sm">{log.adminName}</span>
            <span className="text-white/30 text-xs">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          {log.details && (
            <p className="text-white/40 text-xs mt-2 font-mono">
              {JSON.stringify(log.details).substring(0, 200)}
            </p>
          )}
        </div>
      ))}
      {(!logs || logs.length === 0) && (
        <div className="text-center py-8 text-white/40">No audit logs yet</div>
      )}
    </div>
  );
}
