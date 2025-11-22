import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getSpeedBonus,
  formatResponseTime,
  calculateRankings,
  type PlayerScore,
} from "./scoring";

describe("calculateScore", () => {
  describe("correct answers", () => {
    it("should return 15 points for correct answer with 2s response (2000ms)", () => {
      expect(calculateScore(true, 2000)).toBe(15);
    });

    it("should return 15 points for correct answer with 0s response (0ms) - edge case", () => {
      expect(calculateScore(true, 0)).toBe(15);
    });

    it("should return 15 points for correct answer with 3s response (3000ms) - boundary", () => {
      expect(calculateScore(true, 3000)).toBe(15);
    });

    it("should return 13 points for correct answer with 4s response (4000ms)", () => {
      expect(calculateScore(true, 4000)).toBe(13);
    });

    it("should return 13 points for correct answer with 3.001s response (3001ms) - boundary", () => {
      expect(calculateScore(true, 3001)).toBe(13);
    });

    it("should return 13 points for correct answer with 5s response (5000ms) - boundary", () => {
      expect(calculateScore(true, 5000)).toBe(13);
    });

    it("should return 10 points for correct answer with 10s response (10000ms)", () => {
      expect(calculateScore(true, 10000)).toBe(10);
    });

    it("should return 10 points for correct answer with 5.001s response (5001ms) - boundary", () => {
      expect(calculateScore(true, 5001)).toBe(10);
    });

    it("should return 10 points for correct answer with 15s response (15000ms) - max time", () => {
      expect(calculateScore(true, 15000)).toBe(10);
    });
  });

  describe("incorrect answers", () => {
    it("should return 0 points for incorrect answer with any time", () => {
      expect(calculateScore(false, 0)).toBe(0);
      expect(calculateScore(false, 2000)).toBe(0);
      expect(calculateScore(false, 5000)).toBe(0);
      expect(calculateScore(false, 10000)).toBe(0);
      expect(calculateScore(false, 15000)).toBe(0);
    });
  });
});

describe("getSpeedBonus", () => {
  it("should return 5 for 0-3000ms (0-3 seconds)", () => {
    expect(getSpeedBonus(0)).toBe(5);
    expect(getSpeedBonus(1000)).toBe(5);
    expect(getSpeedBonus(2000)).toBe(5);
    expect(getSpeedBonus(3000)).toBe(5);
  });

  it("should return 3 for 3001-5000ms (3-5 seconds)", () => {
    expect(getSpeedBonus(3001)).toBe(3);
    expect(getSpeedBonus(4000)).toBe(3);
    expect(getSpeedBonus(5000)).toBe(3);
  });

  it("should return 0 for 5001-15000ms (5-15 seconds)", () => {
    expect(getSpeedBonus(5001)).toBe(0);
    expect(getSpeedBonus(10000)).toBe(0);
    expect(getSpeedBonus(15000)).toBe(0);
  });
});

describe("formatResponseTime", () => {
  it("should format response time to 1 decimal place", () => {
    expect(formatResponseTime(0)).toBe("0.0s");
    expect(formatResponseTime(1000)).toBe("1.0s");
    expect(formatResponseTime(2000)).toBe("2.0s");
    expect(formatResponseTime(2300)).toBe("2.3s");
    expect(formatResponseTime(5000)).toBe("5.0s");
    expect(formatResponseTime(10000)).toBe("10.0s");
    expect(formatResponseTime(12500)).toBe("12.5s");
    expect(formatResponseTime(15000)).toBe("15.0s");
  });

  it("should handle fractional seconds correctly", () => {
    expect(formatResponseTime(1234)).toBe("1.2s");
    expect(formatResponseTime(5678)).toBe("5.7s");
    expect(formatResponseTime(9999)).toBe("10.0s"); // Rounds to 1 decimal
  });
});

describe("calculateRankings", () => {
  it("should rank players by total score (descending)", () => {
    const players: PlayerScore[] = [
      { playerId: "1", totalScore: 50, cumulativeResponseTimeMs: 10000 },
      { playerId: "2", totalScore: 30, cumulativeResponseTimeMs: 8000 },
      { playerId: "3", totalScore: 40, cumulativeResponseTimeMs: 9000 },
    ];

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].playerId).toBe("1");
    expect(ranked[0].totalScore).toBe(50);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[1].playerId).toBe("3");
    expect(ranked[1].totalScore).toBe(40);
    expect(ranked[2].rank).toBe(3);
    expect(ranked[2].playerId).toBe("2");
    expect(ranked[2].totalScore).toBe(30);
  });

  it("should break ties by cumulative response time (ascending - faster wins)", () => {
    const players: PlayerScore[] = [
      { playerId: "1", totalScore: 50, cumulativeResponseTimeMs: 15000 }, // Slower
      { playerId: "2", totalScore: 50, cumulativeResponseTimeMs: 10000 }, // Faster - should win
      { playerId: "3", totalScore: 30, cumulativeResponseTimeMs: 5000 },
    ];

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].playerId).toBe("2"); // Faster time wins tie
    expect(ranked[0].totalScore).toBe(50);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[1].playerId).toBe("1"); // Slower time loses tie
    expect(ranked[1].totalScore).toBe(50);
    expect(ranked[2].rank).toBe(3);
    expect(ranked[2].playerId).toBe("3");
    expect(ranked[2].totalScore).toBe(30);
  });

  it("should assign same rank for players with same score and time", () => {
    const players: PlayerScore[] = [
      { playerId: "1", totalScore: 50, cumulativeResponseTimeMs: 10000 },
      { playerId: "2", totalScore: 50, cumulativeResponseTimeMs: 10000 }, // Same score and time
      { playerId: "3", totalScore: 30, cumulativeResponseTimeMs: 5000 },
    ];

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].playerId).toBe("1");
    expect(ranked[1].rank).toBe(1); // Same rank
    expect(ranked[1].playerId).toBe("2");
    expect(ranked[2].rank).toBe(3); // Next rank after tie (standard competition ranking)
    expect(ranked[2].playerId).toBe("3");
  });

  it("should handle empty array", () => {
    const players: PlayerScore[] = [];
    const ranked = calculateRankings(players);
    expect(ranked).toHaveLength(0);
  });

  it("should handle single player", () => {
    const players: PlayerScore[] = [
      { playerId: "1", totalScore: 50, cumulativeResponseTimeMs: 10000 },
    ];

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].playerId).toBe("1");
  });

  it("should handle complex tie scenario", () => {
    const players: PlayerScore[] = [
      { playerId: "1", totalScore: 50, cumulativeResponseTimeMs: 12000 },
      { playerId: "2", totalScore: 50, cumulativeResponseTimeMs: 10000 }, // Fastest of 50s
      { playerId: "3", totalScore: 50, cumulativeResponseTimeMs: 15000 }, // Slowest of 50s
      { playerId: "4", totalScore: 40, cumulativeResponseTimeMs: 8000 },
      { playerId: "5", totalScore: 40, cumulativeResponseTimeMs: 8000 }, // Same as player 4
    ];

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(5);
    // Player 2 should be first (50 points, fastest time)
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].playerId).toBe("2");
    // Player 1 should be second (50 points, middle time)
    expect(ranked[1].rank).toBe(2);
    expect(ranked[1].playerId).toBe("1");
    // Player 3 should be third (50 points, slowest time)
    expect(ranked[2].rank).toBe(3);
    expect(ranked[2].playerId).toBe("3");
    // Players 4 and 5 should be tied for 4th (same score and time)
    expect(ranked[3].rank).toBe(4);
    expect(ranked[3].playerId).toBe("4");
    expect(ranked[4].rank).toBe(4); // Same rank
    expect(ranked[4].playerId).toBe("5");
  });
});

