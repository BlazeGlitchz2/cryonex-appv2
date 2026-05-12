import { render, screen } from "@testing-library/react";
import { FileText, StickyNote } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { MobileWorkspaceChrome } from "./MobileWorkspaceChrome";

const baseProps = {
  activeTab: "summary",
  activeToolLabel: "Summary",
  brief: {
    headline: "Cell Structure",
    subheadline: "Study the source",
    focusLabel: "Biology",
    recommendedToolId: "notes",
    recommendedToolLabel: "Notes",
    recommendedToolReason: "Write the idea",
    badges: ["English"],
  },
  coach: {
    title: "Coach",
    description: "Ask for help",
    prompt: "Help me study",
  },
  onBack: vi.fn(),
  onOpenAssistant: vi.fn(),
  onSelectTool: vi.fn(),
  studyTimeLabel: "0:00",
  tools: [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      brief: {
        eyebrow: "Read",
        description: "Read the source summary",
        metric: "ready",
      },
    },
    {
      id: "notes",
      label: "Notes",
      icon: StickyNote,
      brief: {
        eyebrow: "Write",
        description: "Capture notes",
        metric: "next",
      },
    },
  ],
};

describe("MobileWorkspaceChrome", () => {
  it("keeps the tools drawer button visible for immersive summary tabs", () => {
    render(<MobileWorkspaceChrome {...baseProps} />);

    expect(screen.getByRole("button", { name: /tools/i })).toBeInTheDocument();
  });
});
