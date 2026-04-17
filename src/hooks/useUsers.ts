import { useState, useEffect, useCallback } from 'react';
import type { MonDressUpUrls, RoleWithClub } from '@/types/types';
import { userService } from '../services/users.service';
import type { User, UserUpdate } from '../services/index';

// Interface for hook options
export interface UseUsersOptions {
  limit?: number; // How many users to fetch
  autoFetch?: boolean; // Whether to fetch automatically
}

// Interface for hook return value
export interface UseUsersReturn {
  // State
  users: User[];
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;

  // Update user
  updateUser: (id: number, updates: UserUpdate) => Promise<User | null>;

  // Delete user
  deleteUser: (id: number) => Promise<boolean>;

  // Get all clubs associated with user ID
  getMyClubs: (limit: 10, offset: 0) => Promise<RoleWithClub[]>;

  // Update profile picture (if u want)
  updateProfilePicture: (pfpUrl: string) => Promise<User>;

  // Update the base model mon of user
  updateMonBaseUrl: (monUrl: string) => Promise<User>;

  // Update the hat url of mon
  updateMonHatUrl: (hatUrl: string) => Promise<User>;

  // Update shirt url of mon
  updateMonShirtUrl: (shirtUrl: string) => Promise<User>;

  // Update wand url of mon
  updateMonWandUrl: (wandUrl: string) => Promise<User>;

  // Get all dress up mon urls (base, hat, shirt, wand)
  getMonUrls: () => Promise<MonDressUpUrls>;
}

/**
 *
 * Scaffolded hook; only fetchUsers, update/delete user are done
 * Missing:
    getMyClubs,
    updateMonBaseUrl,
    updateMonHatUrl,
    updateMonShirtUrl,
    updateMonWandUrl,
    getMonUrls
 */
export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { limit = 10, autoFetch = true } = options;

  // Main states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true); // Start loading
      setError(null); // Clear previous errors
      const data = await userService.getUsers(limit);
      setUsers(data); // Update data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false); // Always stop loading
    }
  }, [limit]);

  const updateUser = useCallback(async (id: number, updates: UserUpdate): Promise<User | null> => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(id, updates);

      // Update only specified User in array
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));

      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await userService.deleteUser(id);

      // Remove from local state
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return true; // deleted success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false; // not deleted
    }
  }, []);

  const updateMonHatUrl = useCallback(async (hatUrl: string) => {
    try {
      setError(null);
      return await userService.updateMonHatUrl(hatUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hat');
      throw err;
    }
  }, []);

  const updateMonShirtUrl = useCallback(async (shirtUrl: string) => {
    try {
      setError(null);
      return await userService.updateMonShirtUrl(shirtUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shirt');
      throw err;
    }
  }, []);

  const updateMonWandUrl = useCallback(async (wandUrl: string) => {
    try {
      setError(null);
      return await userService.updateMonWandUrl(wandUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wand');
      throw err;
    }
  }, []);

  const getMonUrls = useCallback(async () => {
    try {
      setError(null);
      return await userService.getMonUrls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mon urls');
      throw err;
    }
  }, []);

  const getMyClubs = useCallback(async () => {
    try {
      setError(null);
      return await userService.getMyClubs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
      return [];
    }
  }, []);

  const updateMonBaseUrl = useCallback(async (monUrl: string) => {
    try {
      setError(null);
      return await userService.updateMonBaseUrl(monUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update base mon');
      throw err;
    }
  }, []);

  const updateProfilePicture = useCallback(async (pfpUrl: string): Promise<User> => {
    try {
      setError(null);
      return await userService.updateProfilePicture(pfpUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile picture');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [fetchUsers, autoFetch]); // Runs when function or autoFetch changes

  return {
    users,
    loading,
    error,

    // Functions
    refetch: fetchUsers,
    updateUser,
    deleteUser,
    getMyClubs,
    updateMonBaseUrl,
    updateMonHatUrl,
    updateMonShirtUrl,
    updateMonWandUrl,
    getMonUrls,
    updateProfilePicture,
  };
}
