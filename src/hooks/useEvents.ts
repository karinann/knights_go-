import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/events.service';
import type { Event } from '../services/index';

export interface UseEventsOptions {
  autoFetch?: boolean; // whether to fetch automatically
}

export interface UseEventsReturn {
  events: Event[]; // upcoming events of clubs user joined
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { autoFetch = true } = options;

  // main states
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true); // start loading events
      setError(null); // clear previous errors
      const data = await eventService.getAllUpcomingClubEvents();
      setEvents(data); // update data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false); // always stopo loading
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      // only auto-fetch if enabled (if user session is confirmed)
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
