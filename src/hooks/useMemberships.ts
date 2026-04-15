import { useState, useCallback } from 'react';
import { membershipsService } from '../services/memberships.service';
import type { Member, MemberInsert } from '../services/index';

// Interface for hook options
export interface UseMembersOptions {
  limit?: number; // How many Members to fetch
  autoFetch?: boolean; // Whether to fetch automatically
}

// Interface for hook return value
export interface UseMembersReturn {
  // State
  members: Member[];
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  joinClub: (member: MemberInsert) => Promise<Member | null>;
  leaveClub: (clubId: number, userId: number) => Promise<boolean>;
  isMemberClub: (clubId: number, userId: number) => Promise<boolean>;
  updateMemberRole: (clubId: number, userId: number, role: string) => Promise<Member>;
  getMemberCount: (clubId: number) => Promise<number | null>;
  getClubMembers: (id: number) => Promise<Member[]>;
}

/*
 * Scaffoled hook
 */

export function useMembers(options: UseMembersOptions = {}): UseMembersReturn {
  // Func defs here
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClubMembers = useCallback(async (clubId: number): Promise<Member[]> => {
    try {
      setLoading(true);
      setError(null);
      const clubMembers = await membershipsService.getClubMembers(clubId);

      setMembers(clubMembers);
      return clubMembers;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members,
    loading,
    error,

    refetch,
    joinClub,
    leaveClub,
    isMemberClub,
    updateMemberRole,
    getClubMembers,
  };
}
