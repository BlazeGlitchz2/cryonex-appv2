import { describe, expect, it } from "vitest";

import {
  assertStorageClaimableByUser,
  requireOwnedStorageId,
  userOwnsStorageId,
} from "./storageAccess";

function createMockCtx(data: {
  users?: any[];
  studyDocuments?: any[];
  studyMaterials?: any[];
  imageOcclusions?: any[];
  generatedAssets?: any[];
  chats?: any[];
  messagesByChat?: Record<string, any[]>;
}) {
  return {
    db: {
      query(table: string) {
        const rows = (data as Record<string, any[]>)[table] ?? [];

        return {
          filter() {
            return {
              async collect() {
                return rows;
              },
            };
          },
          async collect() {
            return rows;
          },
          withIndex(_index: string, callback: (q: any) => any) {
            callback({ eq: () => ({}) });
            return {
              async collect() {
                return data.messagesByChat?.[String((rows as any)?._id)] ?? [];
              },
            };
          },
        };
      },
    },
  };
}

describe("storageAccess", () => {
  it("treats storage referenced by a user-owned material as owned", async () => {
    const ctx = createMockCtx({
      studyMaterials: [{ userId: "user-1", storageId: "storage-1" }],
      chats: [],
    });

    await expect(userOwnsStorageId(ctx, "user-1", "storage-1")).resolves.toBe(
      true,
    );
    await expect(
      requireOwnedStorageId(ctx, "user-1", "storage-1"),
    ).resolves.toBeUndefined();
  });

  it("rejects claiming storage already linked to a different user", async () => {
    const ctx = createMockCtx({
      users: [{ _id: "user-2", imageStorageId: "storage-2" }],
      chats: [],
    });

    await expect(
      assertStorageClaimableByUser(ctx, "user-1", "storage-2"),
    ).rejects.toThrow("already owned");
  });
});
