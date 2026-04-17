import { useState, useCallback, useEffect } from 'react';
import { XpLevelUpInfo, EventAttendanceSheet, EventFilters } from '@/types/types';
import { eventAttendanceService } from '../services/event.attendance.service';
import type { Attendance } from '../services/index';

// Interface for hook options
export interface UseAttendanceOptions {
  limit?: number; // How many Attendances to fetch
  autoFetch?: boolean; // Whether to fetch automatically
}

// Interface for hook return value
export interface UseAttendanceReturn {
  // State
  attendances: Attendance[];
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;

  // Registers a user for an event
  registerUserForClubEvent: (eventId: number) => Promise<Attendance>;

  // Checks into event and awards XP (all in one call!!!)
  checkInEvent: (eventId: number) => Promise<{
    attendance: Attendance;
    xpAwarded: XpLevelUpInfo;
  }>;

  // Gets people who have registered for the event
  getEventRegistrations: (eventId: number) => Promise<Attendance[]>;

  // Checks if a user has registered for an event
  isUserRegistered: (eventId: number) => Promise<boolean>;

  // Gets all user's registered events within a club
  // Filter by: club id, upcoming, and past. No filters = getAll
  getAllMyEvents: (filters?: EventFilters) => Promise<EventAttendanceSheet[]>;
}

export function useAttendance(options: UseAttendanceOptions = {}): UseAttendanceReturn {
  const { limit, autoFetch = true } = options;

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendances with optional limit
  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // You'll need to implement this method if you want to fetch all attendances
      // For now, we'll use getAllMyEvents as an alternative
      const events = await eventAttendanceService.getAllMyEvents();
      // Extract attendances from the events
      const fetchedAttendances = events.map((event) => event.attendance);
      const limitedAttendances = limit ? fetchedAttendances.slice(0, limit) : fetchedAttendances;
      setAttendances(limitedAttendances);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Register user for club event
  const registerUserForClubEvent = useCallback(
    async (eventId: number): Promise<Attendance> => {
      setLoading(true);
      setError(null);
      try {
        const attendance = await eventAttendanceService.registerUserForClubEvent(eventId);
        // Refresh attendances list if needed
        await fetchAttendances();
        return attendance;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAttendances],
  );

  // Check in to event and award XP
  const checkInEvent = useCallback(
    async (
      eventId: number,
    ): Promise<{
      attendance: Attendance;
      xpAwarded: XpLevelUpInfo;
    }> => {
      setLoading(true);
      setError(null);
      try {
        const result = await eventAttendanceService.checkInEvent(eventId);
        // Refresh attendances list after check-in
        await fetchAttendances();
        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAttendances],
  );

  // Get event registrations (for club reps/admins)
  const getEventRegistrations = useCallback(async (eventId: number): Promise<Attendance[]> => {
    setLoading(true);
    setError(null);
    try {
      const registrations = await eventAttendanceService.getEventRegistrations(eventId);
      return registrations;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is registered for an event
  const isUserRegistered = useCallback(async (eventId: number): Promise<boolean> => {
    try {
      const registered = await eventAttendanceService.isUserRegistered(eventId);
      return registered;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get all user's events with optional filters
  const getAllMyEvents = useCallback(
    async (filters?: EventFilters): Promise<EventAttendanceSheet[]> => {
      setLoading(true);
      setError(null);
      try {
        const events = await eventAttendanceService.getAllMyEvents(filters);
        return events;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    await fetchAttendances();
  }, [fetchAttendances]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchAttendances();
    }
  }, [autoFetch, fetchAttendances]);

  return {
    attendances,
    loading,
    error,
    refetch,
    registerUserForClubEvent,
    checkInEvent,
    getEventRegistrations,
    isUserRegistered,
    getAllMyEvents,
  };
}
