import { useEffect } from "react";
import { useConvex } from "convex/react";
import { Capacitor } from "@capacitor/core";

export const UpdateChecker = () => {
    const convex = useConvex();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            import("../services/UpdateService").then(({ UpdateService }) => {
                const updateService = new UpdateService(convex);
                updateService.checkForUpdates();
            }).catch(err => console.error("Failed to load UpdateService:", err));
        }
    }, [convex]);

    return null;
};
