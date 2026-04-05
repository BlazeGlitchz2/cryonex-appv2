import { useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";

export interface ActivityTrackingContext {
  source?: string;
  section?: string;
  title?: string;
}

export interface ActivityEventInput extends ActivityTrackingContext {
  eventType: string;
  details?: Record<string, unknown>;
}

export function useActivityTracking(defaultContext?: ActivityTrackingContext) {
  const { user } = useAuth();
  const logActivity = useMutation(api.admin.logActivityEvent);
  const deviceInfo = useDeviceInfo();
  const deviceType = useDeviceType();

  const trackActivity = useCallback(
    (event: ActivityEventInput) => {
      if (!user) return null;

      return logActivity({
        source: event.source || defaultContext?.source || "app",
        eventType: event.eventType,
        section: event.section ?? defaultContext?.section,
        title: event.title ?? defaultContext?.title,
        platform: deviceInfo.isAndroid
          ? "android"
          : deviceInfo.isIOS
            ? "ios"
            : "web",
        deviceType,
        details: event.details,
      });
    },
    [
      defaultContext?.section,
      defaultContext?.source,
      defaultContext?.title,
      deviceInfo.isAndroid,
      deviceInfo.isIOS,
      deviceType,
      logActivity,
      user,
    ],
  );

  return {
    trackActivity,
    deviceType,
    deviceInfo,
  };
}
