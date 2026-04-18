import { describe, expect, it } from "vitest";

import {
  getCanonicalSchoolId,
  getSchoolConfig,
  isLegacySchoolId,
} from "./schoolConfig";

describe("schoolConfig legacy migration helpers", () => {
  it("normalizes legacy Jubail school ids to the canonical Alhussan Jubail id", () => {
    expect(getCanonicalSchoolId("jubail_international_school")).toBe(
      "ahis_jubail",
    );
    expect(getCanonicalSchoolId("jis_jubail")).toBe("ahis_jubail");
  });

  it("keeps current school ids unchanged", () => {
    expect(getCanonicalSchoolId("ahis_jubail")).toBe("ahis_jubail");
  });

  it("flags legacy ids and resolves them to a usable school config", () => {
    expect(isLegacySchoolId("jubail_international_school")).toBe(true);
    expect(getSchoolConfig("jubail_international_school")?.name).toBe(
      "Alhussan International School - Jubail",
    );
  });
});
