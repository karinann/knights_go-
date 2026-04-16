import { BaseService } from './base.service';
import type { XPLevel } from './index';
import type { XpInfo, XpLeaderboardUser, XpLevelUpInfo } from '../types/types';

// eslint-disable-next-line import/prefer-default-export
export class XPLevelUpService extends BaseService {
  // Award XP to a user and update their level based on total XP
  async awardXP(userId: number, xpAmount: number): Promise<XpLevelUpInfo> {
    try {
      // Get current user data
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('experience_points, experience_level')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const oldLevel = user.experience_level || 1;
      const oldXP = user.experience_points || 0;
      const newTotalXP = oldXP + xpAmount;

      // Get old title based on old XP
      const oldTitle = await this.getTitleFromXP(oldXP);

      // Determine new level and title based on new total XP
      const newLevelInfo = await this.getLevelFromXP(newTotalXP);
      const leveledUp = newLevelInfo.level > oldLevel;

      // Update user's XP and level
      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          experience_points: newTotalXP,
          experience_level: newLevelInfo.level,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return {
        newTotalXP,
        leveledUp,
        oldLevel,
        newLevel: newLevelInfo.level,
        oldTitle,
        newTitle: newLevelInfo.title,
      };
    } catch (error) {
      this.handleError(error, 'awardXP');
      throw error;
    }
  }

  // Get level and title based on total XP using the xp_levels table
  async getLevelFromXP(totalXP: number): Promise<XPLevel> {
    try {
      // Let Supabase/PostgreSQL do the filtering
      const { data, error } = await this.supabase
        .from('xp_levels')
        .select('*')
        .lte('min_xp', totalXP) // XP >= min_xp
        .or(`max_xp.is.null,max_xp.gte.${totalXP}`) // XP <= max_xp OR max_xp is null
        .order('level', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback
        return {
          created_at: new Date().toISOString(),
          level: 1,
          title: 'Wildcard',
          min_xp: 0,
          max_xp: null,
        };
      }

      return data[0];
    } catch (error) {
      this.handleError(error, 'getLevelFromXP');
      throw error;
    }
  }

  // Get just the title based on XP
  async getTitleFromXP(totalXP: number): Promise<string> {
    const levelInfo = await this.getLevelFromXP(totalXP);
    if (levelInfo.title === null) {
      levelInfo.title = 'Wildcard';
    }
    return levelInfo.title;
  }

  // Get all level definitions
  async getAllLevels(): Promise<XPLevel[]> {
    try {
      const { data, error } = await this.supabase
        .from('xp_levels')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      this.handleError(error, 'getAllLevels');
      throw error;
    }
  }

  // Get detailed user level info including progress to next level
  async getUserLevelInfo(userId: number): Promise<XpInfo> {
    try {
      // Get user data
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('experience_points, experience_level')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const currentXP = user.experience_points || 0;

      // Get current level info
      const currentLevelInfo = await this.getLevelFromXP(currentXP);

      // Get next level info
      const { data: nextLevelData, error: nextLevelError } = await this.supabase
        .from('xp_levels')
        .select('level, min_xp, title')
        .eq('level', currentLevelInfo.level + 1)
        .single();

      let nextLevel = null;
      let nextTitle = null;
      let xpNeededForNextLevel = null;
      let progressToNextLevel = 0;

      if (nextLevelData && !nextLevelError) {
        nextLevel = nextLevelData.level;
        nextTitle = nextLevelData.title;
        xpNeededForNextLevel = nextLevelData.min_xp - currentXP;

        // Calculate progress percentage
        const levelRange = nextLevelData.min_xp - currentLevelInfo.min_xp;
        const xpInLevel = currentXP - currentLevelInfo.min_xp;
        progressToNextLevel = (xpInLevel / levelRange) * 100;
      } else if (currentLevelInfo.max_xp === null) {
        // This is the max level
        progressToNextLevel = 100;
      }
      const payload: XpInfo = {
        currentXP,
        currentLevel: currentLevelInfo.level,
        currentTitle: currentLevelInfo.title,
        currentLevelMinXP: currentLevelInfo.min_xp,
        currentLevelMaxXP: currentLevelInfo.max_xp,
        nextLevel,
        nextTitle,
        xpNeededForNextLevel,
        progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
      };
      return payload;
    } catch (error) {
      this.handleError(error, 'getUserLevelInfo');
      throw error;
    }
  }

  // Get leaderboard with titles
  async getXPLeaderboard(limit: 10): Promise<XpLeaderboardUser[]> {
    try {
      // Get top users by XP
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, experience_points, experience_level, avatar_url')
        .order('experience_points', { ascending: false })
        .limit(limit);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        return [];
      }

      // Get titles for each user based on their XP
      const leaderboard = await Promise.all(
        users.map(async (user) => {
          const title = await this.getTitleFromXP(user.experience_points || 0);
          return {
            ...user,
            title,
          };
        }),
      );

      return leaderboard;
    } catch (error) {
      this.handleError(error, 'getXPLeaderboard');
      throw error;
    }
  }
}

export const xPLevelUpService = new XPLevelUpService();
