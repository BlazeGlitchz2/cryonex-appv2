import { useEffect } from "react";
import { useConvex } from "convex/react";
import { UpdateService } from "../services/UpdateService";

export const UpdateChecker = () => {
    const convex = useConvex();

    useEffect(() => {
        const updateService = new UpdateService(convex);
        updateService.checkForUpdates();
    }, [convex]);

    return null;
};
