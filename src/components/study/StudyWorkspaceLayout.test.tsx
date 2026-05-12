import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudyWorkspaceLayout } from "./StudyWorkspaceLayout";

const renderLayout = (activeTab: string) =>
  render(
    <StudyWorkspaceLayout
      activeTab={activeTab}
      header={<div>Header</div>}
      sidebar={<div>Sidebar</div>}
      content={<div>Main workspace</div>}
      chat={<div>Assistant rail</div>}
    />,
  );

describe("StudyWorkspaceLayout", () => {
  it("does not render the assistant rail on the summary tab", () => {
    renderLayout("summary");

    expect(screen.getByText("Main workspace")).toBeInTheDocument();
    expect(screen.queryByText("Assistant rail")).not.toBeInTheDocument();
  });

  it("keeps the assistant rail available on non-summary tools", () => {
    renderLayout("chat");

    expect(screen.getByText("Assistant rail")).toBeInTheDocument();
  });
});
