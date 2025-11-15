import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Star,
  Trash2,
  Edit2,
  Archive,
  Download,
  GitCompare,
  StarOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Branch = {
  id: string;
  name: string;
  color: string;
  parentMessageIndex: number;
  messageCount: number;
  lastUpdated: number;
  isFavorite?: boolean;
  isArchived?: boolean;
};

type BranchManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  currentBranch: string;
  onSelectBranch: (branchId: string) => void;
  onRenameBranch: (branchId: string, newName: string) => void;
  onDeleteBranch: (branchId: string) => void;
  onToggleFavorite: (branchId: string) => void;
  onArchiveBranch: (branchId: string) => void;
  onExportBranch: (branchId: string) => void;
  onCompareBranches: (branchId1: string, branchId2: string) => void;
};

export default function BranchManager({
  open,
  onOpenChange,
  branches,
  currentBranch,
  onSelectBranch,
  onRenameBranch,
  onDeleteBranch,
  onToggleFavorite,
  onArchiveBranch,
  onExportBranch,
  onCompareBranches,
}: BranchManagerProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [compareMode, setCompareMode] = React.useState(false);
  const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>([]);

  const favoriteBranches = branches.filter(b => b.isFavorite && !b.isArchived);
  const activeBranches = branches.filter(b => !b.isFavorite && !b.isArchived);
  const archivedBranches = branches.filter(b => b.isArchived);

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const commitRename = () => {
    if (editingId && editingName.trim()) {
      onRenameBranch(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleCompareSelect = (branchId: string) => {
    if (selectedForCompare.includes(branchId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== branchId));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, branchId]);
    }

    if (selectedForCompare.length === 1 && !selectedForCompare.includes(branchId)) {
      onCompareBranches(selectedForCompare[0], branchId);
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Branch Manager
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 border-b space-y-2">
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              className="w-full"
            >
              <GitCompare className="h-4 w-4 mr-2" />
              {compareMode ? "Cancel Compare" : "Compare Branches"}
            </Button>
            {compareMode && (
              <p className="text-xs text-muted-foreground">
                Select 2 branches to compare
              </p>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-4">
              {favoriteBranches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    Favorites
                  </h3>
                  <div className="space-y-2">
                    {favoriteBranches.map(branch => (
                      <BranchItem
                        key={branch.id}
                        branch={branch}
                        isActive={currentBranch === branch.id}
                        isEditing={editingId === branch.id}
                        editingName={editingName}
                        compareMode={compareMode}
                        isSelectedForCompare={selectedForCompare.includes(branch.id)}
                        onSelect={() => compareMode ? handleCompareSelect(branch.id) : onSelectBranch(branch.id)}
                        onRename={(name) => setEditingName(name)}
                        onStartRename={() => startRename(branch.id, branch.name)}
                        onCommitRename={commitRename}
                        onDelete={() => setDeleteConfirmId(branch.id)}
                        onToggleFavorite={() => onToggleFavorite(branch.id)}
                        onArchive={() => onArchiveBranch(branch.id)}
                        onExport={() => onExportBranch(branch.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-2">Active Branches</h3>
                <div className="space-y-2">
                  {activeBranches.map(branch => (
                    <BranchItem
                      key={branch.id}
                      branch={branch}
                      isActive={currentBranch === branch.id}
                      isEditing={editingId === branch.id}
                      editingName={editingName}
                      compareMode={compareMode}
                      isSelectedForCompare={selectedForCompare.includes(branch.id)}
                      onSelect={() => compareMode ? handleCompareSelect(branch.id) : onSelectBranch(branch.id)}
                      onRename={(name) => setEditingName(name)}
                      onStartRename={() => startRename(branch.id, branch.name)}
                      onCommitRename={commitRename}
                      onDelete={() => setDeleteConfirmId(branch.id)}
                      onToggleFavorite={() => onToggleFavorite(branch.id)}
                      onArchive={() => onArchiveBranch(branch.id)}
                      onExport={() => onExportBranch(branch.id)}
                    />
                  ))}
                </div>
              </div>

              {archivedBranches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archived
                  </h3>
                  <div className="space-y-2">
                    {archivedBranches.map(branch => (
                      <BranchItem
                        key={branch.id}
                        branch={branch}
                        isActive={false}
                        isEditing={false}
                        editingName=""
                        compareMode={false}
                        isSelectedForCompare={false}
                        onSelect={() => onSelectBranch(branch.id)}
                        onRename={() => {}}
                        onStartRename={() => {}}
                        onCommitRename={() => {}}
                        onDelete={() => setDeleteConfirmId(branch.id)}
                        onToggleFavorite={() => {}}
                        onArchive={() => onArchiveBranch(branch.id)}
                        onExport={() => onExportBranch(branch.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation branch and all its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) onDeleteBranch(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type BranchItemProps = {
  branch: Branch;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  compareMode: boolean;
  isSelectedForCompare: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onExport: () => void;
};

function BranchItem({
  branch,
  isActive,
  isEditing,
  editingName,
  compareMode,
  isSelectedForCompare,
  onSelect,
  onRename,
  onStartRename,
  onCommitRename,
  onDelete,
  onToggleFavorite,
  onArchive,
  onExport,
}: BranchItemProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer",
        isActive && "border-primary bg-accent",
        !isActive && "hover:bg-accent/50",
        compareMode && isSelectedForCompare && "border-primary bg-primary/10"
      )}
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={editingName}
            onChange={(e) => onRename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitRename();
              if (e.key === "Escape") onCommitRename();
            }}
            className="h-8"
            autoFocus
          />
          <Button size="sm" onClick={onCommitRename}>
            Save
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: branch.color }}
              />
              <span className="font-medium text-sm truncate">{branch.name}</span>
              {branch.isFavorite && (
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            {!compareMode && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                >
                  {branch.isFavorite ? (
                    <StarOff className="h-3 w-3" />
                  ) : (
                    <Star className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartRename();
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Branched from message {branch.parentMessageIndex + 1}</div>
            <div className="flex items-center justify-between">
              <span>{branch.messageCount} messages</span>
              <span>{new Date(branch.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>

          {!compareMode && (
            <div className="flex gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              >
                <Archive className="h-3 w-3 mr-1" />
                {branch.isArchived ? "Unarchive" : "Archive"}
              </Button>
              {branch.id !== "main" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
