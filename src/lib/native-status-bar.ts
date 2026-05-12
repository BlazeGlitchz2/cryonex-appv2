const NON_OVERLAY_STATUS_BAR_PATH_PREFIXES = ["/auth", "/login"];

export function shouldOverlayStatusBar(pathname: string) {
  return !NON_OVERLAY_STATUS_BAR_PATH_PREFIXES.some(
    (pathPrefix) =>
      pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`),
  );
}
