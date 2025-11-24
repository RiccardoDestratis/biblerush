import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getSpeedBonus,
  formatResponseTime,
  calculateRankings,
  type PlayerScore,
} from "./scoring";

describe("calculateScore", () => {
  describe("correct answers - Tier 1 (0-3000ms = +5 bonus)", () => {
    it("should return 15 points for 0ms - edge case: instant answer", () => {
      expect(calculateScore(true, 0)).toBe(15);
    });

    it("should return 15 points for 500ms", () => {
      expect(calculateScore(true, 500)).toBe(15);
    });

    it("should return 15 points for 1000ms", () => {
      expect(calculateScore(true, 1000)).toBe(15);
    });

    it("should return 15 points for 2000ms", () => {
      expect(calculateScore(true, 2000)).toBe(15);
    });

    it("should return 15 points for 2500ms", () => {
      expect(calculateScore(true, 2500)).toBe(15);
    });

    it("should return 15 points for 2999ms", () => {
      expect(calculateScore(true, 2999)).toBe(15);
    });

    it("should return 15 points for 3000ms - boundary: exactly 3 seconds", () => {
      expect(calculateScore(true, 3000)).toBe(15);
    });
  });

  describe("correct answers - Tier 2 (3001-5000ms = +3 bonus)", () => {
    it("should return 13 points for 3001ms - boundary: just over 3 seconds", () => {
      expect(calculateScore(true, 3001)).toBe(13);
    });

    it("should return 13 points for 3500ms", () => {
      expect(calculateScore(true, 3500)).toBe(13);
    });

    it("should return 13 points for 4000ms", () => {
      expect(calculateScore(true, 4000)).toBe(13);
    });

    it("should return 13 points for 4500ms", () => {
      expect(calculateScore(true, 4500)).toBe(13);
    });

    it("should return 13 points for 4999ms", () => {
      expect(calculateScore(true, 4999)).toBe(13);
    });

    it("should return 13 points for 5000ms - boundary: exactly 5 seconds", () => {
      expect(calculateScore(true, 5000)).toBe(13);
    });
  });

  describe("correct answers - Tier 3 (5001-15000ms = +0 bonus)", () => {
    it("should return 10 points for 5001ms - boundary: just over 5 seconds", () => {
      expect(calculateScore(true, 5001)).toBe(10);
    });

    it("should return 10 points for 6000ms", () => {
      expect(calculateScore(true, 6000)).toBe(10);
    });

    it("should return 10 points for 8000ms", () => {
      expect(calculateScore(true, 8000)).toBe(10);
    });

    it("should return 10 points for 10000ms", () => {
      expect(calculateScore(true, 10000)).toBe(10);
    });

    it("should return 10 points for 12000ms", () => {
      expect(calculateScore(true, 12000)).toBe(10);
    });

    it("should return 10 points for 15000ms - boundary: max question time", () => {
      expect(calculateScore(true, 15000)).toBe(10);
    });

    it("should return 10 points for 16000ms - edge case: beyond max time, no bonus", () => {
      expect(calculateScore(true, 16000)).toBe(10);
    });
  });

  describe("incorrect answers", () => {
    it("should return 0 points for incorrect answer with 0ms", () => {
      expect(calculateScore(false, 0)).toBe(0);
    });

    it("should return 0 points for incorrect answer with 2000ms", () => {
      expect(calculateScore(false, 2000)).toBe(0);
    });

    it("should return 0 points for incorrect answer with 5000ms", () => {
      expect(calculateScore(false, 5000)).toBe(0);
    });

    it("should return 0 points for incorrect answer with 10000ms", () => {
      expect(calculateScore(false, 10000)).toBe(0);
    });

    it("should return 0 points for incorrect answer with 15000ms", () => {
      expect(calculateScore(false, 15000)).toBe(0);
    });
  });
});

describe("getSpeedBonus", () => {
  describe("Tier 1 (0-3000ms = +5 bonus)", () => {
    it("should return 5 for 0ms", () => {
      expect(getSpeedBonus(0)).toBe(5);
    });

    it("should return 5 for 500ms", () => {
      expect(getSpeedBonus(500)).toBe(5);
    });

    it("should return 5 for 1000ms", () => {
      expect(getSpeedBonus(1000)).toBe(5);
    });

    it("should return 5 for 2000ms", () => {
      expect(getSpeedBonus(2000)).toBe(5);
    });

    it("should return 5 for 2500ms", () => {
      expect(getSpeedBonus(2500)).toBe(5);
    });

    it("should return 5 for 2999ms", () => {
      expect(getSpeedBonus(2999)).toBe(5);
    });

    it("should return 5 for 3000ms - boundary: exactly 3 seconds", () => {
      expect(getSpeedBonus(3000)).toBe(5);
    });
  });

  describe("Tier 2 (3001-5000ms = +3 bonus)", () => {
    it("should return 3 for 3001ms - boundary: just over 3 seconds", () => {
      expect(getSpeedBonus(3001)).toBe(3);
    });

    it("should return 3 for 3500ms", () => {
      expect(getSpeedBonus(3500)).toBe(3);
    });

    it("should return 3 for 4000ms", () => {
      expect(getSpeedBonus(4000)).toBe(3);
    });

    it("should return 3 for 4500ms", () => {
      expect(getSpeedBonus(4500)).toBe(3);
    });

    it("should return 3 for 4999ms", () => {
      expect(getSpeedBonus(4999)).toBe(3);
    });

    it("should return 3 for 5000ms - boundary: exactly 5 seconds", () => {
      expect(getSpeedBonus(5000)).toBe(3);
    });
  });

  describe("Tier 3 (5001-15000ms = +0 bonus)", () => {
    it("should return 0 for 5001ms - boundary: just over 5 seconds", () => {
      expect(getSpeedBonus(5001)).toBe(0);
    });

    it("should return 0 for 6000ms", () => {
      expect(getSpeedBonus(6000)).toBe(0);
    });

    it("should return 0 for 8000ms", () => {
      expect(getSpeedBonus(8000)).toBe(0);
    });

    it("should return 0 for 10000ms", () => {
      expect(getSpeedBonus(10000)).toBe(0);
    });

    it("should return 0 for 12000ms", () => {
      expect(getSpeedBonus(12000)).toBe(0);
    });

    it("should return 0 for 15000ms - boundary: max question time", () => {
      expect(getSpeedBonus(15000)).toBe(0);
    });

    it("should return 0 for 16000ms - edge case: beyond max time", () => {
      expect(getSpeedBonus(16000)).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle negative time gracefully (should return 5 as fastest tier)", () => {
      // Negative time is invalid but function should handle it
      expect(getSpeedBonus(-100)).toBe(5);
    });

    it("should handle very large times (no bonus)", () => {
      expect(getSpeedBonus(30000)).toBe(0);
      expect(getSpeedBonus(60000)).toBe(0);
      expect(getSpeedBonus(999999)).toBe(0);
    });
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

  it("should handle very large response times", () => {
    expect(formatResponseTime(999999)).toBe("1000.0s"); // 999.999s rounds to 1000.0s
    expect(formatResponseTime(150000)).toBe("150.0s");
    expect(formatResponseTime(999900)).toBe("999.9s"); // Exactly 999.9s
  });

  it("should handle edge case: exactly 1 millisecond", () => {
    expect(formatResponseTime(1)).toBe("0.0s");
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

  it("should handle 100+ players efficiently", () => {
    // Generate 150 players with varying scores
    const players: PlayerScore[] = [];
    for (let i = 0; i < 150; i++) {
      players.push({
        playerId: `player-${i}`,
        totalScore: Math.floor(Math.random() * 200), // 0-199 points
        cumulativeResponseTimeMs: Math.floor(Math.random() * 150000), // 0-150 seconds total
      });
    }

    const startTime = performance.now();
    const ranked = calculateRankings(players);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Verify all players are ranked
    expect(ranked).toHaveLength(150);

    // Verify ranking order (descending by score, then ascending by time)
    for (let i = 0; i < ranked.length - 1; i++) {
      const current = ranked[i];
      const next = ranked[i + 1];

      // Either current score is higher, or same score with faster time
      expect(
        current.totalScore > next.totalScore ||
          (current.totalScore === next.totalScore &&
            current.cumulativeResponseTimeMs <= next.cumulativeResponseTimeMs)
      ).toBe(true);
    }

    // Verify ranks are assigned correctly (1, 2, 3, ...)
    // Ranks should be sequential or same for ties
    for (let i = 0; i < ranked.length; i++) {
      expect(ranked[i].rank).toBeGreaterThanOrEqual(1);
      expect(ranked[i].rank).toBeLessThanOrEqual(150);
    }

    // Performance check: Should complete in reasonable time (<100ms for 150 players)
    expect(executionTime).toBeLessThan(100);

    // Verify first player has highest score (or tied highest with fastest time)
    const highestScore = Math.max(...players.map((p) => p.totalScore));
    const topPlayers = ranked.filter((p) => p.totalScore === highestScore);
    const fastestTopPlayer = topPlayers.reduce((fastest, current) =>
      current.cumulativeResponseTimeMs < fastest.cumulativeResponseTimeMs
        ? current
        : fastest
    );
    expect(ranked[0].totalScore).toBe(highestScore);
    expect(ranked[0].playerId).toBe(fastestTopPlayer.playerId);
  });

  it("should handle 100+ players with many ties", () => {
    // Create 100 players, many with same scores
    const players: PlayerScore[] = [];
    for (let i = 0; i < 100; i++) {
      players.push({
        playerId: `player-${i}`,
        totalScore: i % 10 === 0 ? 50 : i % 5 === 0 ? 40 : 30, // Many ties
        cumulativeResponseTimeMs: i * 100, // Different times
      });
    }

    const ranked = calculateRankings(players);

    expect(ranked).toHaveLength(100);

    // Verify ranking order is maintained
    for (let i = 0; i < ranked.length - 1; i++) {
      const current = ranked[i];
      const next = ranked[i + 1];

      expect(
        current.totalScore > next.totalScore ||
          (current.totalScore === next.totalScore &&
            current.cumulativeResponseTimeMs <= next.cumulativeResponseTimeMs)
      ).toBe(true);
    }

    // Verify players with same score and time get same rank
    const scoreTimeGroups = new Map<string, number[]>();
    ranked.forEach((player, index) => {
      const key = `${player.totalScore}-${player.cumulativeResponseTimeMs}`;
      if (!scoreTimeGroups.has(key)) {
        scoreTimeGroups.set(key, []);
      }
      scoreTimeGroups.get(key)!.push(player.rank);
    });

    // All players with same score+time should have same rank
    scoreTimeGroups.forEach((ranks) => {
      const uniqueRanks = new Set(ranks);
      expect(uniqueRanks.size).toBe(1); // All should have same rank
    });
  });
});

