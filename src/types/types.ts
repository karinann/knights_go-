import { Club } from './database.types';

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
