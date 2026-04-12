import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import BottomNav from '@/components/BottomNav';
import styles from '../styles/events.module.css';
import Link from 'next/link';

interface Club {
  id: number;
  club_name: string;
}

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  description: string | null;
  club_id: number;
  longitude: number;
  latitude: number;
  base_xp: number | null;
  club?: Club;
}

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchEvents();
  }, [user]);

  async function fetchEvents() {
    // setEvents(MOCK_EVENTS);
    // setLoading(false);

    const supabase = createClient();

    // get user's integer id
    const { data: userData } = await supabase
      .from('users')
      .select('id, club_ids')
      .eq('user_id', user?.id)
      .single();

    if (!userData) {
      setLoading(false);
      return;
    }

    // get club memberships for this user
    const { data: memberships } = await supabase
      .from('club_memberships')
      .select('club_id')
      .eq('user_id', userData.id);

    if (!memberships || memberships.length === 0) {
      setLoading(false);
      return;
    }

    const clubIds = memberships.map((m) => m.club_id);

    // fetch upcoming events from those clubs
    // also fetch the club name in the same query
    const { data: eventData } = await supabase
      .from('events')
      .select(
        `
        *,
        club:club_id (
          id,
          club_name
        )
      `,
      )
      .in('club_id', clubIds)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (eventData) setEvents(eventData);
    setLoading(false);
    // */
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Events</h1>
            <p className={styles.subtitle}>From your clubs</p>
          </div>
          <Link href="/clubs?mode=manage" className={styles.manageButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Clubs
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        {loading && <p className={styles.hint}>Loading events...</p>}

        {!loading && events.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No upcoming events</p>
            <p className={styles.emptyHint}>Join more clubs to see their events here</p>
          </div>
        )}

        {!loading &&
          events.map((event) => {
            const isExpanded = expandedId === event.id;
            return (
              <div key={event.id} className={isExpanded ? styles.cardExpanded : styles.card}>
                {/* main row — always visible */}
                <button
                  type="button"
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div className={styles.cardLeft}>
                    <div className={styles.dateBadge}>
                      <span className={styles.dateDay}>{new Date(event.event_date).getDate()}</span>
                      <span className={styles.dateMonth}>
                        {new Date(event.event_date).toLocaleString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className={styles.cardInfo}>
                      <p className={styles.eventName}>{event.event_name}</p>
                      <p className={styles.clubName}>{event.club?.club_name}</p>
                    </div>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={isExpanded ? styles.chevronUp : styles.chevronDown}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* expanded details */}
                {isExpanded && (
                  <div className={styles.cardDetails}>
                    <div className={styles.detailRow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M16 2V6M8 2V6M3 10H21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>{formatDate(event.event_date)}</span>
                    </div>

                    <div className={styles.detailRow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2C8.686 2 6 4.686 6 8C6 12.5 12 19 12 19C12 19 18 12.5 18 8C18 4.686 15.314 2 12 2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span>
                        {event.latitude && event.longitude
                          ? `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`
                          : 'Location TBA'}
                      </span>
                    </div>

                    {event.description && (
                      <div className={styles.detailRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 6H20M4 10H20M4 14H14"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{event.description}</span>
                      </div>
                    )}

                    {event.base_xp && <div className={styles.xpBadge}>+{event.base_xp} XP</div>}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* <BottomNav activePage="events" /> */}
      <BottomNav />
    </div>
  );
}
