export interface User {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  mon_url?: string;
  user_type: 'student' | 'club_rep' | 'admin';
  created_at: string;
  experience_level: number;
  experience_points: number;
}

export interface Club {
  id: number;
  club_name: string;
  description?: string;
  category: 'cultural' | 'academic' | 'greek life' | 'special interest' | 'volunteer' | 'other';
  logo_url?: string;
  sprite_url?: string;
  created_at: string;
  created_by: number;
  experience_level: number;
  experience_points: number;
}

export interface Event {
  id: number;
  club_id: number;
  event_name: string;
  description?: string;
  event_date: string;
  longitude: number;
  latitude: number;
  base_xp: number;
  bonus_xp: number;
  created_at: string;
}

export interface Membership {
  membership_id: number;
  user_id: number;
  club_id: number;
  role?: string;
  joined_at: string;
}

// Input types (stuff sent to API)
export interface CreateUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type?: User['user_type'];
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  mon_url?: string;
}

export interface CreateClubInput {
  club_name: string;
  description?: string;
  category: Club['category'];
  logo_url?: string;
  sprite_url?: string;
}

export interface UpdateClubInput {
  club_name?: string;
  description?: string;
  category?: Club['category'];
  logo_url?: string;
  sprite_url?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
