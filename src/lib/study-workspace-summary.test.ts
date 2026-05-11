import { describe, expect, it } from "vitest";

import { resolveStudyWorkspaceSummaryContent } from "./study-workspace-summary";

describe("resolveStudyWorkspaceSummaryContent", () => {
  it("uses the simple summary when simple mode is active and content exists", () => {
    expect(
      resolveStudyWorkspaceSummaryContent(
        {
          simple: "Simple version",
          detailed: "Detailed version",
          short: "Short version",
        },
        true,
      ),
    ).toBe("Simple version");
  });

  it("falls back to detailed and short summaries instead of blanking simple mode", () => {
    expect(
      resolveStudyWorkspaceSummaryContent(
        {
          simple: "",
          detailed: "Detailed fallback",
          short: "Short fallback",
        },
        true,
      ),
    ).toBe("Detailed fallback");

    expect(
      resolveStudyWorkspaceSummaryContent(
        {
          simple: "",
          detailed: "",
          short: "Short fallback",
        },
        true,
      ),
    ).toBe("Short fallback");
  });

  it("falls back in detailed mode when generated detailed content is missing", () => {
    expect(
      resolveStudyWorkspaceSummaryContent(
        {
          simple: "Simple fallback",
          detailed: "",
          short: "Short fallback",
        },
        false,
      ),
    ).toBe("Simple fallback");
  });
});
