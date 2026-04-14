import { useState, useCallback } from 'react';
import { XpLevelUpInfo } from '@/types/types';
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
}

/*
 * Scaffolded hook; please handle the api calls on ur own
 */

export function useAttendance(options: UseAttendanceOptions = {}): UseAttendanceReturn {
  // Func defs here
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    attendances,
    loading,
    error,

    registerUserForClubEvent,
    checkInEvent,
    getEventRegistrations,
    isUserRegistered,
  };
}
