import { Club } from '../services/index';

// For storing all of user's clubs
export interface RoleWithClub {
  club: {
    id: number;
    club_name: string;
    description: string | null;
    category: string;
    logo_url: string | null;
  };
  role: string;
}

// For Club member returns
export interface ClubMember {
  membership_id: number;
  user_id: number;
  club_id: number;
  role: string | null;
  joined_at: string;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}
export interface SearchClubsParams {
  category?: Club['category'];
  club_name?: string;
  limit?: number;
  offset?: number;
}

export interface XpLevelUpInfo {
  newTotalXP: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  oldTitle: string | null;
  newTitle: string | null;
}

export interface XpAwarded {
  xp_amnt: number;
  level: number;
  title: string | null;
  min_xp: number;
  max_xp: number | null;
}

export interface XpInfo {
  currentXP: number;
  currentLevel: number;
  currentTitle: string | null;
  currentLevelMinXP: number;
  currentLevelMaxXP: number | null;
  nextLevel: number | null;
  nextTitle: string | null;
  xpNeededForNextLevel: number | null;
  progressToNextLevel: number;
}

export interface XpLeaderboardUser {
  id: number;
  first_name: string;
  last_name: string;
  experience_points: number | null;
  experience_level: number | null;
  title: string | null;
  avatar_url: string | null;
}

export interface XpCheckInStats {
  userXP: {
    experience_level: number | null;
    experience_points: number | null;
  };
  leveledUp: boolean;
  oldTitle: string;
  newTitle: string;
  xpEarned: number;
}
