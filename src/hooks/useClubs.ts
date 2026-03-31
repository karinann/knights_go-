import { useState, useEffect, useCallback } from 'react';
import { clubService } from '../services/clubs.service';
import type { Club, ClubInsert, ClubUpdate } from '../types/database.types';
import type { ClubMember } from '../types/types'

// Interface for hook options
export interface UseClubsOptions {
  limit?: number; // How many clubs to fetch
  autoFetch?: boolean; // Whether to fetch automatically
}

export interface SearchClubsParams {
  category?: Club['category'],
  club_name?: string,
  limit?: number,
  offset?: number
}

// Interface for hook return value
export interface UseClubsReturn {
  // State
  clubs: Club[];
  loading: boolean;
  error: string | null;
  members: ClubMember[] | null;
  membersLoading: boolean;
  membersError: string | null;

  // Actions
  refetch: () => Promise<void>;
  createClub: (club: ClubInsert) => Promise<Club | null>;
  updateClub: (id: number, updates: ClubUpdate) => Promise<Club | null>;
  deleteClub: (id: number) => Promise<boolean>;
  getClubMembers: (id: number) => Promise<ClubMember[]>;
}

export function useClubs(options: UseClubsOptions = {}): UseClubsReturn {
  const { limit = 10, autoFetch = true } = options;

  // Main states
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true); // Start loading
      setError(null); // Clear previous errors
      const data = await clubService.getClubs(limit);
      setClubs(data); // Update data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false); // Always stop loading
    }
  }, [limit]);

  const createClub = useCallback(async (club: ClubInsert): Promise<Club | null> => {
  try {
    setError(null)                                            // Clear errors
    const newClub = await clubService.createClub(club)
    setClubs(prev => [newClub, ...prev])                      // Add to beginning
    return newClub                                            // Return for component
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create club')
    return null                                               // failure case
  }
  }, [])

  const updateClub = useCallback(async(id: number, updates: ClubUpdate): Promise<Club | null> => {
    try {
      setError(null)
      const updatedClub = await clubService.updateClub(id, updates)

      // Update only specified club in array
      setClubs(prev => prev.map(club =>
        club.id === id ? updatedClub : club
      ))

      return updatedClub

    } catch (err) {
      setError(err instanceof Error ? err.message:
        "Failed to update club"
      )
      return null
    }
  }, [])

  const deleteClub = useCallback(async (id: number): Promise<boolean> => {
    try {

      setError(null)
      await clubService.deleteClub(id)

      // Remove from local state
      setClubs(prev => prev.filter(club => club.id !== id))
      return true // deleted success
    }
    catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete club")
      return false // not deleted
    }
  }, [])

  const getClubMembers = useCallback(async (id: number): Promise<ClubMember[]> => {
    try {
      setMembersLoading(true)
      setMembersError(null)
      const clubMembers = await clubService.getClubMembers(id)

      setMembers(clubMembers)
      return clubMembers
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Failed to fetch members")
      return [];
    } finally {
      setMembersLoading(false)
    }
  }, [])

  const getAllClubsByParams = useCallback(async (params: SearchClubsParams): Promise<Club[]> => {
    try {
      setError(null)
      const res = await clubService.getAllClubsByParam(params)
      setClubs(res)
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find clubs by param")
      return []
    }
  }, [])


  useEffect(() => {
    if (autoFetch) {
      fetchClubs()
    }
  }, [fetchClubs, autoFetch])  // Runs when function or autoFetch changes

  return {
    clubs,
    loading,
    error,
    members,
    membersLoading,
    membersError,
    refetch: fetchClubs,
    createClub,
    updateClub,
    deleteClub,
    getClubMembers,
  }
}
