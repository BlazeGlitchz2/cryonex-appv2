import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatSaveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saveTitle: string;
    setSaveTitle: (title: string) => void;
    saveCategory: string;
    setSaveCategory: (category: string) => void;
    saveType: "library" | "project";
    setSaveType: (type: "library" | "project") => void;
    onSave: () => void;
}

export function ChatSaveDialog({
    open,
    onOpenChange,
    saveTitle,
    setSaveTitle,
    saveCategory,
    setSaveCategory,
    saveType,
    setSaveType,
    onSave,
}: ChatSaveDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[425px] rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle>Save Content</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Save this conversation to your library or start a new project.
                    </DialogDescription>
                </DialogHeader>
                <Tabs
                    defaultValue="library"
                    onValueChange={(v) => setSaveType(v as any)}
                    className="w-full mt-2"
                >
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
                        <TabsTrigger
                            value="library"
                            className="rounded-lg data-[state=active]:bg-white/10"
                        >
                            Library
                        </TabsTrigger>
                        <TabsTrigger
                            value="project"
                            className="rounded-lg data-[state=active]:bg-white/10"
                        >
                            New Project
                        </TabsTrigger>
                    </TabsList>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={saveTitle}
                                onChange={(e) => setSaveTitle(e.target.value)}
                                className="bg-black/40 border-white/10 rounded-xl"
                                placeholder="Enter title..."
                            />
                        </div>
                        <TabsContent value="library" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    value={saveCategory}
                                    onChange={(e) => setSaveCategory(e.target.value)}
                                    className="bg-black/40 border-white/10 rounded-xl"
                                    placeholder="e.g. Protocol, Intel..."
                                />
                            </div>
                        </TabsContent>
                        <div className="pt-2">
                            <Button
                                onClick={onSave}
                                className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold"
                            >
                                {saveType === "library" ? "Save to Library" : "Create Project"}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
