import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function useTimeline(chatId: Id<"chats"> | null) {
  const chat = useQuery(api.chats.get, chatId ? { chatId } : "skip");
  const createBranch = useMutation(api.chats.createBranch);
  const updateBranch = useMutation(api.chats.updateBranch);
  const deleteBranch = useMutation(api.chats.deleteBranch);
  const setPosition = useMutation(api.chats.setTimelinePosition);

  const currentBranch = chat?.currentBranchId || "main";
  const timelinePosition = chat?.timelinePosition || 0;
  const branches = [
    { id: "main", name: "Main", color: "#3b82f6", parentMessageIndex: -1, messageCount: 0, lastUpdated: Date.now(), isFavorite: false, isArchived: false },
    ...(chat?.branches || []).map(b => ({
      ...b,
      messageCount: 0,
      lastUpdated: b.createdAt,
    })),
  ];

  const handleCreateBranch = useCallback(async (fromPosition: number, branchName?: string) => {
    if (!chatId) return;
    
    try {
      const name = branchName || `Branch ${branches.length}`;
      const branchId = await createBranch({
        chatId,
        branchName: name,
        parentMessageIndex: fromPosition,
      });
      toast.success(`Created branch: ${name}`);
      return branchId;
    } catch (error) {
      toast.error("Failed to create branch");
      console.error(error);
    }
  }, [chatId, createBranch, branches.length]);

  const handleRenameBranch = useCallback(async (branchId: string, newName: string) => {
    if (!chatId) return;
    
    try {
      await updateBranch({ chatId, branchId, name: newName });
      toast.success("Branch renamed");
    } catch (error) {
      toast.error("Failed to rename branch");
    }
  }, [chatId, updateBranch]);

  const handleDeleteBranch = useCallback(async (branchId: string) => {
    if (!chatId) return;
    
    try {
      await deleteBranch({ chatId, branchId });
      toast.success("Branch deleted");
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  }, [chatId, deleteBranch]);

  const handleToggleFavorite = useCallback(async (branchId: string) => {
    if (!chatId) return;
    
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    
    try {
      await updateBranch({ chatId, branchId, isFavorite: !branch.isFavorite });
    } catch (error) {
      toast.error("Failed to update branch");
    }
  }, [chatId, updateBranch, branches]);

  const handleArchiveBranch = useCallback(async (branchId: string) => {
    if (!chatId) return;
    
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    
    try {
      await updateBranch({ chatId, branchId, isArchived: !branch.isArchived });
      toast.success(branch.isArchived ? "Branch unarchived" : "Branch archived");
    } catch (error) {
      toast.error("Failed to archive branch");
    }
  }, [chatId, updateBranch, branches]);

  const handleSetPosition = useCallback(async (position: number) => {
    if (!chatId) return;
    
    try {
      await setPosition({ chatId, position });
    } catch (error) {
      console.error("Failed to set position:", error);
    }
  }, [chatId, setPosition]);

  const handleSwitchBranch = useCallback(async (branchId: string) => {
    if (!chatId) return;
    
    try {
      await setPosition({ chatId, position: timelinePosition, branchId });
    } catch (error) {
      toast.error("Failed to switch branch");
    }
  }, [chatId, setPosition, timelinePosition]);

  return {
    currentBranch,
    timelinePosition,
    branches,
    handleCreateBranch,
    handleRenameBranch,
    handleDeleteBranch,
    handleToggleFavorite,
    handleArchiveBranch,
    handleSetPosition,
    handleSwitchBranch,
  };
}
