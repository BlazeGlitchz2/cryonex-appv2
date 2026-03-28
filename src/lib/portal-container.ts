export const APP_OVERLAY_ROOT_ID = "app-overlay-root";

export function getAppOverlayContainer() {
  if (typeof document === "undefined") {
    return undefined;
  }

  return document.getElementById(APP_OVERLAY_ROOT_ID) ?? document.body;
}
