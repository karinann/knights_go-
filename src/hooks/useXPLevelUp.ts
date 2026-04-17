import { useState, useCallback, useEffect } from 'react';
import type { XPLevel } from '../services/index';
import type { XpCheckInStats, XpInfo, XpLeaderboardUser, XpLevelUpInfo } from '../types/types';
import { xPLevelUpService } from '@/services/xp.levelup.service';

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
  getAllLevels: () => Promise<XPLevel[]>;

  // Manually award xp to a user
  awardXP: (userId: number, xpAmount: number) => Promise<XpLevelUpInfo>;

  // Get detailed info about User's level stuff
  getUserLevelInfo: (userId: number) => Promise<XpInfo>;

  // In case you want to have a leaderboard for xp levels
  getXPLeaderboard: (limit: 10) => Promise<XpLeaderboardUser[]>;
}

/*
 * Scaffolded hook; please handle the api calls on ur own
 */

export function useXPLevelUp(options: UseXPLevelUpOptions = {}): UseXPLevelUpReturn {
  const { limit = 10, autoFetch = true } = options;

  // Func defs here
  const [XPLevels, setXPLevels] = useState<XPLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllLevels = useCallback(async (): Promise<XPLevel[]> => {
    setLoading(true);
    setError(null);
    try {
      const levels = await xPLevelUpService.getAllLevels();
      setXPLevels(levels);
      return levels;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const awardXP = useCallback(async (userId: number, xpAmount: number): Promise<XpLevelUpInfo> => {
    setLoading(true);
    setError(null);
    try {
      const result = await xPLevelUpService.awardXP(userId, xpAmount);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLevelInfo = useCallback(async (userId: number): Promise<XpInfo> => {
    setLoading(true);
    setError(null);
    try {
      const info = await xPLevelUpService.getUserLevelInfo(userId);
      return info;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getXPLeaderboard = useCallback(
    async (leaderboardLimit: number = 10): Promise<XpLeaderboardUser[]> => {
      setLoading(true);
      setError(null);
      try {
        // Ensure the limit is a number, but cast if needed
        const limit = leaderboardLimit as 10; // Cast to the expected literal type
        const leaderboard = await xPLevelUpService.getXPLeaderboard(limit);
        return leaderboard;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refetch = useCallback(async (): Promise<void> => {
    await getAllLevels();
  }, [getAllLevels]);

  useEffect(() => {
    if (autoFetch) {
      getAllLevels();
    }
  }, [autoFetch, getAllLevels]);

  return {
    XPLevels,
    loading,
    error,

    refetch,
    getAllLevels,
    awardXP,
    getUserLevelInfo,
    getXPLeaderboard,
    // awardEventCheckInXP,
  };
}
