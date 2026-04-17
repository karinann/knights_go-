import { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useAttendance } from '@/hooks/useAttendance';
import { useClubs } from '@/hooks/useClubs';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import styles from '../styles/events.module.css';

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  location: string | null;
  description: string | null;
  base_xp: number | null;
  club_id: number;
}

interface ClubInfo {
  id: number;
  club_name: string;
  logo_url: string | null;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set());
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [clubMap, setClubMap] = useState<Map<number, ClubInfo>>(new Map());

  const { events, loading, error } = useEvents({ autoFetch: !!user });
  const {
    registerUserForClubEvent,
    isUserRegistered,
    loading: attendanceLoading,
  } = useAttendance({ autoFetch: false });
  const { getAllClubsByParams } = useClubs({ autoFetch: false });

  // Fetch all clubs that the user has events for
  useEffect(() => {
    async function fetchClubsForEvents() {
      if (!events.length) return;

      // Get unique club IDs from events
      const uniqueClubIds: number[] = [];
      events.forEach((event) => {
        if (!uniqueClubIds.includes(event.club_id)) {
          uniqueClubIds.push(event.club_id);
        }
      });

      // Fetch all clubs in one go (more efficient than fetching one by one)
      const allClubs = await getAllClubsByParams({ limit: 100 });

      // Create a map of club id to club info
      const clubInfoMap = new Map<number, ClubInfo>();
      uniqueClubIds.forEach((clubId) => {
        const club = allClubs.find((c) => c.id === clubId);
        if (club) {
          clubInfoMap.set(clubId, {
            id: club.id,
            club_name: club.club_name,
            logo_url: club.logo_url || null,
          });
        } else {
          // Fallback if club not found
          clubInfoMap.set(clubId, {
            id: clubId,
            club_name: 'Unknown Club',
            logo_url: null,
          });
        }
      });

      setClubMap(clubInfoMap);
    }

    fetchClubsForEvents();
  }, [events, getAllClubsByParams]);

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

  async function handleRegister(eventId: number) {
    setRegisteringId(eventId);
    try {
      await registerUserForClubEvent(eventId);
      setRegisteredEvents((prev) => new Set(prev).add(eventId));
      console.log('Successfully registered for event!');
    } catch (err: any) {
      console.error('Failed to register:', err.message);
      alert(err.message || 'Failed to register for event. Please try again.');
    } finally {
      setRegisteringId(null);
    }
  }

  async function checkRegistrationStatus(eventId: number) {
    if (!user) return;

    try {
      const isRegistered = await isUserRegistered(eventId);
      if (isRegistered) {
        setRegisteredEvents((prev) => new Set(prev).add(eventId));
      }
    } catch (err) {
      console.error('Failed to check registration status:', err);
    }
  }

  useEffect(() => {
    if (events.length > 0 && user) {
      events.forEach((event) => {
        checkRegistrationStatus(event.id);
      });
    }
  }, [events, user]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Events</h1>
            <p className={styles.subtitle}>From your clubs</p>
          </div>
          <Link href="/manageclubs" className={styles.manageButton}>
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
        {error && <p className={styles.hint}>Error: {error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No upcoming events</p>
            <p className={styles.emptyHint}>Join more clubs to see their events here</p>
            <Link href="/manageclubs" className={styles.emptyLink}>
              Browse clubs
            </Link>
          </div>
        )}

        {!loading &&
          events.map((event: Event) => {
            const isExpanded = expandedId === event.id;
            const isRegistered = registeredEvents.has(event.id);
            const isRegistering = registeringId === event.id;
            const club = clubMap.get(event.club_id);
            const clubName = club?.club_name || 'Loading...';
            const clubLogo = club?.logo_url;

            return (
              <div key={event.id} className={isExpanded ? styles.cardExpanded : styles.card}>
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
                      {/* Club name with icon */}
                      <div className={styles.clubInfo}>
                        {clubLogo ? (
                          <img src={clubLogo} alt={clubName} className={styles.clubLogo} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 9L12 3L21 9L12 15L3 9Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 11V17L12 21L19 17V11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <span className={styles.clubName}>{clubName}</span>
                      </div>
                      {event.location && <p className={styles.locationPreview}>{event.location}</p>}
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

                    {/* Club in expanded view */}
                    <div className={styles.detailRow}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 9L12 3L21 9L12 15L3 9Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 11V17L12 21L19 17V11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{clubName}</span>
                    </div>

                    {event.location && (
                      <div className={styles.detailRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2C8.686 2 6 4.686 6 8C6 12.5 12 19 12 19C12 19 18 12.5 18 8C18 4.686 15.314 2 12 2Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    )}

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

                    {event.base_xp && (
                      <div className={styles.xpBadge}>+{event.base_xp} XP for attending</div>
                    )}

                    {user && (
                      <div className={styles.registerSection}>
                        {isRegistered ? (
                          <div className={styles.registeredBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Registered for this event</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRegister(event.id)}
                            disabled={isRegistering || attendanceLoading}
                            className={styles.registerButton}
                          >
                            {isRegistering ? (
                              <>
                                <span className={styles.spinner}></span>
                                Registering...
                              </>
                            ) : (
                              'Register for Event'
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <BottomNav />
    </div>
  );
}
