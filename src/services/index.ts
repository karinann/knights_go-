import { Database } from '@/types/database.types';
import { ClubService } from './clubs.service';
import { UserService } from './users.service';
import { MembershipsService } from './memberships.service';

// Create helper types for easier usage
// User
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Club
export type Club = Database['public']['Tables']['clubs']['Row'];
export type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
export type ClubUpdate = Database['public']['Tables']['clubs']['Update'];

// Member
export type Member = Database['public']['Tables']['club_memberships']['Row'];
export type MemberInsert = Database['public']['Tables']['club_memberships']['Insert'];
export type MemberUpdate = Database['public']['Tables']['club_memberships']['Update'];

// Member
export type Event = Database['public']['Tables']['events']['Row'];

/* Exporting the API services from the services folder. */
export { ClubService, UserService, MembershipsService };
