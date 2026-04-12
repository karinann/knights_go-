import { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import BottomNav from '@/components/BottomNav';
import styles from '../styles/events.module.css';
import Link from 'next/link';

export default function EventsPage() {
  const { user } = useAuth(); // current logged in user
  const [expandedId, setExpandedId] = useState<number | null>(null); // whether event card is expanded

  // autoFetch is marked ture when user is confirmed logged in
  const { events, loading, error } = useEvents({ autoFetch: !!user });

  // toggles card open or closed, if clicked when open, close it (set to null)
  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // formats date: "Wednesday, Apr 15, 06:00 PM"
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
      {/* Header - title and mange clubs button */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Events</h1>
            <p className={styles.subtitle}>From your clubs</p>
          </div>
          {/* link to manage clubs page */}
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

      {/* main content area */}
      <div className={styles.content}>
        {/* loading events */}
        {loading && <p className={styles.hint}>Loading events...</p>}

        {/* if service call fails: display error */}
        {error && <p className={styles.hint}>Error: {error}</p>}

        {/* empty state: no upcoming events */}
        {!loading && !error && events.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No upcoming events</p>
            <p className={styles.emptyHint}>Join more clubs to see their events here</p>
            <Link href="/manageclubs" className={styles.emptyLink}>
              Browse clubs
            </Link>
          </div>
        )}

        {/* events list displayed after loading is complete */}
        {!loading &&
          events.map((event) => {
            const isExpanded = expandedId === event.id;

            return (
              <div
                key={event.id}
                // swap to expanded when selected
                className={isExpanded ? styles.cardExpanded : styles.card}
              >
                {/* card header */}
                <button
                  type="button"
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div className={styles.cardLeft}>
                    {/* dd/mm abbreviation */}
                    <div className={styles.dateBadge}>
                      <span className={styles.dateDay}>{new Date(event.event_date).getDate()}</span>
                      <span className={styles.dateMonth}>
                        {new Date(event.event_date).toLocaleString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className={styles.cardInfo}>
                      <p className={styles.eventName}>{event.event_name}</p>
                      {/* location shown in collapsed view for quick reference */}
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

                {/* expanded details */}
                {isExpanded && (
                  <div className={styles.cardDetails}>
                    {/* full date and time */}
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

                    {/* building and room number  */}
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

                    {/* optional event description */}
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

                    {/* experience reward */}
                    {event.base_xp && (
                      <div className={styles.xpBadge}>+{event.base_xp} XP for attending</div>
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
