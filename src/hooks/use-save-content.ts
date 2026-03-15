import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useSaveContent() {
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [contentToSave, setContentToSave] = useState("");
    const [saveTitle, setSaveTitle] = useState("");
    const [saveCategory, setSaveCategory] = useState("");
    const [saveType, setSaveType] = useState<"library" | "project">("library");

    const createLibraryItem = useMutation(api.library.create);
    const createProject = useMutation(api.projects.create);

    const executeSave = async () => {
        if (!saveTitle) {
            toast.error("Please enter a title");
            return;
        }
        try {
            if (saveType === "library") {
                await createLibraryItem({
                    title: saveTitle,
                    prompt: contentToSave,
                    category: saveCategory,
                });
                toast.success("Saved to Library");
            } else {
                await createProject({
                    name: saveTitle,
                    description: contentToSave,
                    color: "blue",
                });
                toast.success("Project created");
            }
            setSaveDialogOpen(false);
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    return {
        saveDialogOpen,
        setSaveDialogOpen,
        saveTitle,
        setSaveTitle,
        saveCategory,
        setSaveCategory,
        saveType,
        setSaveType,
        setContentToSave,
        executeSave,
    };
}
