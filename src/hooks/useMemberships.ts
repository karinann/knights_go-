import { useState, useEffect, useCallback } from 'react';
import { MembershipsService } from '../services/memberships.service';
import type { Member, MemberInsert, MemberUpdate } from '../types/database.types';

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
}

export function useUsers(options: UseMembersOptions = {}): UseMembersReturn {
  // Func defs here
}

