import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PlayerAnswerFeedback } from "./player-answer-feedback";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("PlayerAnswerFeedback", () => {
  const defaultProps = {
    gameId: "game-123",
    playerId: "player-123",
    questionId: "question-123",
    correctAnswer: "A",
    correctAnswerText: "Correct Answer Text",
    options: ["Option A", "Option B", "Option C", "Option D"],
    scriptureReference: "John 3:16",
    totalScore: 0,
  };


  describe("correct answer with speed bonus", () => {
    it("should render correct answer with Tier 1 speed bonus (5 points)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      // Check for base points
      expect(screen.getByText("10 points")).toBeInTheDocument();

      // Check for speed bonus
      expect(screen.getByText("+5 speed bonus")).toBeInTheDocument();

      // Advance animation
      vi.advanceTimersByTime(600);

      // Check for total
      expect(screen.getByText(/= 15 total/)).toBeInTheDocument();

      // Check for response time
      expect(screen.getByText("Answered in 2.0s")).toBeInTheDocument();

      // Check for correct icon
      expect(screen.getByText("Correct! Well done!")).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should render correct answer with Tier 2 speed bonus (3 points)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={13}
          responseTimeMs={4000}
          totalScore={13}
        />
      );

      expect(screen.getByText("10 points")).toBeInTheDocument();
      expect(screen.getByText("+3 speed bonus")).toBeInTheDocument();

      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 13 total/)).toBeInTheDocument();
      expect(screen.getByText("Answered in 4.0s")).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should render correct answer with Tier 3 speed bonus (0 points)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={10}
          responseTimeMs={10000}
          totalScore={10}
        />
      );

      expect(screen.getByText("10 points")).toBeInTheDocument();
      expect(screen.getByText("(no speed bonus)")).toBeInTheDocument();

      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 10 total/)).toBeInTheDocument();
      expect(screen.getByText("Answered in 10.0s")).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should display breakdown format: '10 points + 5 speed bonus = 15 total'", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2500}
          totalScore={15}
        />
      );

      expect(screen.getByText("10 points")).toBeInTheDocument();
      expect(screen.getByText("+5 speed bonus")).toBeInTheDocument();

      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 15 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should display breakdown format: '10 points + 3 speed bonus = 13 total'", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={13}
          responseTimeMs={3500}
          totalScore={13}
        />
      );

      expect(screen.getByText("10 points")).toBeInTheDocument();
      expect(screen.getByText("+3 speed bonus")).toBeInTheDocument();

      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 13 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe("incorrect answer", () => {
    it("should render incorrect answer with 0 points and no speed bonus", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="B"
          pointsEarned={0}
          responseTimeMs={2000}
          totalScore={0}
        />
      );

      expect(screen.getByText("Incorrect")).toBeInTheDocument();
      expect(screen.getByText("0 points")).toBeInTheDocument();
      expect(screen.getByText(/Correct answer: A - Correct Answer Text/)).toBeInTheDocument();
      expect(screen.getByText("Answered in 2.0s")).toBeInTheDocument();

      // Should NOT show speed bonus
      expect(screen.queryByText(/speed bonus/)).not.toBeInTheDocument();
    });

    it("should not show speed bonus for incorrect answers", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="B"
          pointsEarned={0}
          responseTimeMs={1000}
          totalScore={0}
        />
      );

      expect(screen.queryByText(/speed bonus/)).not.toBeInTheDocument();
      expect(screen.getByText("0 points")).toBeInTheDocument();
    });
  });

  describe("no answer submitted", () => {
    it("should render no answer with 0 points and no speed bonus", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer={null}
          pointsEarned={0}
          responseTimeMs={0}
          totalScore={0}
        />
      );

      expect(screen.getByText("Time's up! No answer submitted.")).toBeInTheDocument();
      expect(screen.getByText("0 points")).toBeInTheDocument();
      expect(screen.getByText(/Correct answer: A - Correct Answer Text/)).toBeInTheDocument();

      // Should NOT show speed bonus
      expect(screen.queryByText(/speed bonus/)).not.toBeInTheDocument();
      // Should NOT show response time for no answer
      expect(screen.queryByText(/Answered in/)).not.toBeInTheDocument();
    });
  });

  describe("response time formatting", () => {
    it("should format response time to 1 decimal place", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2300}
          totalScore={15}
        />
      );

      expect(screen.getByText("Answered in 2.3s")).toBeInTheDocument();
    });

    it("should format response time correctly for various times", () => {
      const { rerender } = render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={1234}
          totalScore={15}
        />
      );

      expect(screen.getByText("Answered in 1.2s")).toBeInTheDocument();

      rerender(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={5678}
          totalScore={15}
        />
      );

      expect(screen.getByText("Answered in 5.7s")).toBeInTheDocument();
    });
  });

  describe("points count-up animation", () => {
    it("should animate points from 0 to actual points", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 15 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe("visual styling", () => {
    it("should apply correct color classes for base points", () => {
      const { container } = render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      const basePointsElement = screen.getByText("10 points");
      expect(basePointsElement).toHaveClass("text-gray-900", "text-3xl", "font-bold");
    });

    it("should apply correct color classes for speed bonus", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      const speedBonusElement = screen.getByText("+5 speed bonus");
      expect(speedBonusElement).toHaveClass("text-teal-600", "font-semibold");
    });

    it("should apply correct color classes for response time", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      const responseTimeElement = screen.getByText("Answered in 2.0s");
      expect(responseTimeElement).toHaveClass("text-gray-600", "text-sm");
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels for correct answer", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute("aria-live", "polite");
      expect(statusElement).toHaveAttribute("aria-label");
      expect(statusElement.getAttribute("aria-label")).toContain("Correct answer");
      expect(statusElement.getAttribute("aria-label")).toContain("15 total points");
    });

    it("should have proper ARIA labels for incorrect answer", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="B"
          pointsEarned={0}
          responseTimeMs={2000}
          totalScore={0}
        />
      );

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute("aria-live", "polite");
      expect(statusElement).toHaveAttribute("aria-label");
      expect(statusElement.getAttribute("aria-label")).toContain("Incorrect answer");
      expect(statusElement.getAttribute("aria-label")).toContain("0 points");
    });

    it("should have proper ARIA labels for no answer", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer={null}
          pointsEarned={0}
          responseTimeMs={0}
          totalScore={0}
        />
      );

      const statusElement = screen.getByRole("status");
      expect(statusElement).toHaveAttribute("aria-live", "polite");
      expect(statusElement).toHaveAttribute("aria-label");
      expect(statusElement.getAttribute("aria-label")).toContain("Time's up");
      expect(statusElement.getAttribute("aria-label")).toContain("0 points");
    });
  });

  describe("total score display", () => {
    it("should display total score correctly", () => {
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={25}
        />
      );

      expect(screen.getByText("Total Score: 25 points")).toBeInTheDocument();
    });

    it("should update total score correctly across multiple questions", () => {
      const { rerender } = render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={2000}
          totalScore={15}
        />
      );

      expect(screen.getByText("Total Score: 15 points")).toBeInTheDocument();

      rerender(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={13}
          responseTimeMs={4000}
          totalScore={28}
        />
      );

      expect(screen.getByText("Total Score: 28 points")).toBeInTheDocument();
    });
  });

  describe("boundary cases", () => {
    it("should handle exactly 3000ms (Tier 1 boundary)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={15}
          responseTimeMs={3000}
          totalScore={15}
        />
      );

      expect(screen.getByText("+5 speed bonus")).toBeInTheDocument();
      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 15 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should handle exactly 3001ms (Tier 2 boundary)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={13}
          responseTimeMs={3001}
          totalScore={13}
        />
      );

      expect(screen.getByText("+3 speed bonus")).toBeInTheDocument();
      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 13 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should handle exactly 5000ms (Tier 2 boundary)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={13}
          responseTimeMs={5000}
          totalScore={13}
        />
      );

      expect(screen.getByText("+3 speed bonus")).toBeInTheDocument();
      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 13 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should handle exactly 5001ms (Tier 3 boundary)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={10}
          responseTimeMs={5001}
          totalScore={10}
        />
      );

      expect(screen.getByText("(no speed bonus)")).toBeInTheDocument();
      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 10 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it("should handle exactly 15000ms (max time)", async () => {
      vi.useFakeTimers();
      
      render(
        <PlayerAnswerFeedback
          {...defaultProps}
          selectedAnswer="A"
          pointsEarned={10}
          responseTimeMs={15000}
          totalScore={10}
        />
      );

      expect(screen.getByText("(no speed bonus)")).toBeInTheDocument();
      vi.advanceTimersByTime(600);
      expect(screen.getByText(/= 10 total/)).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });
});

