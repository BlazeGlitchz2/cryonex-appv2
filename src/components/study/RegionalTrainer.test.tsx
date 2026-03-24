// @ts-nocheck
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegionalTrainer } from "./RegionalTrainer";

describe("RegionalTrainer", () => {
  it("renders a Saudi-specific trainer shell", () => {
    render(
      <RegionalTrainer
        region="ksa"
        country="sa"
        curriculum="Saudi National (Secondary Tracks)"
        gradeLevel="Grade 11 (Junior)"
        targetExams={["GAT (Qudurat)", "SAAT"]}
        onExit={() => {}}
      />,
    );

    expect(screen.getByText("Saudi exam + track trainer")).toBeInTheDocument();
    expect(
      screen.getByText(/Use Saudi-specific lanes for Qudurat, SAAT/i),
    ).toBeInTheDocument();
  });

  it("renders an Egypt-specific trainer shell", () => {
    render(
      <RegionalTrainer
        region="egypt"
        country="eg"
        curriculum="Egyptian National (Preparatory / Thanaweya Amma)"
        gradeLevel="Grade 12 (Senior)"
        targetExams={["Thanaweya Amma"]}
        onExit={() => {}}
      />,
    );

    expect(screen.getByText("Egypt national trainer")).toBeInTheDocument();
    expect(
      screen.getByText(/Mix preparatory foundations, Thanaweyya discipline/i),
    ).toBeInTheDocument();
  });

  it("starts a lane and reveals the first question", () => {
    render(
      <RegionalTrainer
        country="us"
        region="us"
        curriculum="Common Core"
        gradeLevel="Grade 11 (Junior)"
        targetExams={["SAT"]}
        onExit={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("Start lane"));

    expect(screen.getByText(/Question 1 \/ 3/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Which revision move best strengthens an evidence-based paragraph/i,
      ),
    ).toBeInTheDocument();
  });

  it("calls onExit when the close button is clicked", () => {
    const handleExit = vi.fn();
    render(
      <RegionalTrainer
        country="uk"
        region="uk"
        curriculum="GCSE"
        gradeLevel="Grade 10 (Sophomore)"
        onExit={handleExit}
      />,
    );

    fireEvent.click(screen.getByLabelText("Close regional trainer"));
    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});
