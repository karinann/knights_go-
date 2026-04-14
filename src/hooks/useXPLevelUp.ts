import { useState, useCallback } from 'react';
import type { XPLevel } from '../services/index';
import type { XpCheckInStats, XpInfo, XpLeaderboardUser, XpLevelUpInfo } from '../types/types';

// Interface for hook options
export interface UseXPLevelUpOptions {
  limit?: number; // How many Attendances to fetch
  autoFetch?: boolean; // Whether to fetch automatically
}

// Interface for hook return value
export interface UseXPLevelUpReturn {
  // State
  XPLevels: XPLevel[];
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;

  // Get all possible Xp levels (Page, Squire, etc.)
  getAllLevels(): Promise<XPLevel[]>;

  // Manually award xp to a user
  awardXP(userId: number, xpAmount: number): Promise<XpLevelUpInfo>;

  // Get detailed info about User's level stuff
  getUserLevelInfo: (userId: number) => Promise<XpInfo>;

  // In case you want to have a leaderboard for xp levels
  getXPLeaderboard: (limit: 10) => Promise<XpLeaderboardUser[]>;

  // Awards XP to user (its inside the attendance data) after check in
  // You should probably not use this directly; the event.attendance hook
  // handles it
  awardEventCheckInXP: (attendanceId: number) => Promise<XpCheckInStats>;
}

/*
 * Scaffolded hook; please handle the api calls on ur own
 */

export function useXPLevelUp(options: UseXPLevelUpOptions = {}): UseXPLevelUpReturn {
  // Func defs here
  const [XPLevels, setXPLevels] = useState<XPLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    XPLevels,
    loading,
    error,

    getAllLevels,
    awardXP,
    getUserLevelInfo,
    getXPLeaderboard,
    awardEventCheckInXP,
  };
}
