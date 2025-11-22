/**
 * Scoring calculation utility
 * Implements FR10: Scoring Calculation with speed bonuses
 * 
 * Scoring rules:
 * - Correct answer: 10 base points + speed bonus
 * - Incorrect answer: 0 points
 * - Speed bonus tiers:
 *   - 0-3000ms (0-3 seconds): +5 points → Total 15
 *   - 3001-5000ms (3-5 seconds): +3 points → Total 13
 *   - 5001-15000ms (5-15 seconds): +0 points → Total 10
 */

/**
 * Calculate score based on correctness and response time
 * 
 * @param isCorrect - Whether the answer is correct
 * @param responseTimeMs - Response time in milliseconds (0-15000)
 * @returns Points earned (0 for incorrect, 10-15 for correct)
 */
export function calculateScore(isCorrect: boolean, responseTimeMs: number): number {
  // Incorrect answers get 0 points
  if (!isCorrect) {
    return 0;
  }

  // Base points for correct answer
  const basePoints = 10;

  // Calculate speed bonus
  const speedBonus = getSpeedBonus(responseTimeMs);

  return basePoints + speedBonus;
}

/**
 * Get speed bonus points based on response time
 * Used for notification display (Story 3.3)
 * 
 * @param responseTimeMs - Response time in milliseconds (0-15000)
 * @returns Speed bonus points: 5, 3, or 0
 */
export function getSpeedBonus(responseTimeMs: number): number {
  if (responseTimeMs <= 3000) {
    // 0-3000ms (0-3 seconds): +5 points
    return 5;
  } else if (responseTimeMs <= 5000) {
    // 3001-5000ms (3-5 seconds): +3 points
    return 3;
  } else {
    // 5001-15000ms (5-15 seconds): +0 points
    return 0;
  }
}

/**
 * Format response time in milliseconds to display string
 * Used for leaderboard display (Stories 3.4, 3.5)
 * 
 * @param responseTimeMs - Response time in milliseconds
 * @returns Formatted string like "2.3s" (1 decimal place)
 */
export function formatResponseTime(responseTimeMs: number): string {
  const seconds = responseTimeMs / 1000;
  return `${seconds.toFixed(1)}s`;
}

/**
 * Player score data for ranking calculation
 */
export interface PlayerScore {
  playerId: string;
  totalScore: number;
  cumulativeResponseTimeMs: number; // Sum of all response times across questions
}

/**
 * Ranked player with rank number
 */
export interface RankedPlayer extends PlayerScore {
  rank: number; // 1, 2, 3, etc. (same rank for ties)
}

/**
 * Calculate player rankings with tie-breaking
 * 
 * Tie-breaking rule: If two players have same total_score,
 * rank by lower cumulative response_time_ms (faster total time wins)
 * 
 * @param players - Array of player scores
 * @returns Sorted array with rank numbers (1, 2, 3, etc.)
 */
export function calculateRankings(players: PlayerScore[]): RankedPlayer[] {
  // Sort by total_score (descending), then by cumulative response_time_ms (ascending)
  const sorted = [...players].sort((a, b) => {
    // First, sort by total_score (descending)
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Tie-breaking: Lower cumulative response time wins (ascending)
    return a.cumulativeResponseTimeMs - b.cumulativeResponseTimeMs;
  });

  // Assign ranks (same rank for ties, using standard competition ranking)
  // Standard competition ranking: if two players tie for 1st, next player gets rank 3
  const ranked: RankedPlayer[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    // If this player has same score and time as previous, give same rank
    if (
      i > 0 &&
      sorted[i].totalScore === sorted[i - 1].totalScore &&
      sorted[i].cumulativeResponseTimeMs === sorted[i - 1].cumulativeResponseTimeMs
    ) {
      // Same rank as previous player
      ranked.push({
        ...sorted[i],
        rank: ranked[i - 1].rank,
      });
    } else {
      // New rank: use current position in sorted array (1-based)
      // This implements standard competition ranking where ranks are skipped after ties
      ranked.push({
        ...sorted[i],
        rank: i + 1,
      });
      currentRank = i + 1;
    }
  }

  return ranked;
}

