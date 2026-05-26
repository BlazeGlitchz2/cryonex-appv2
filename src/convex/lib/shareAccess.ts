export function canAccessSharedVisibility(
  viewer: {
    _id?: string | null;
    schoolId?: string | null;
    schoolNetworkOptIn?: boolean | null;
  } | null,
  resource: {
    userId?: string | null;
    visibility?: string | null;
    isPublic?: boolean | null;
    schoolId?: string | null;
  } | null,
) {
  if (!viewer || !resource) return false;

  if (viewer._id && resource.userId && String(viewer._id) === String(resource.userId)) {
    return true;
  }

  if (resource.isPublic || resource.visibility === "public") {
    return true;
  }

  if (
    resource.visibility === "school" &&
    viewer.schoolNetworkOptIn &&
    viewer.schoolId &&
    resource.schoolId &&
    String(viewer.schoolId) === String(resource.schoolId)
  ) {
    return true;
  }

  return false;
}
