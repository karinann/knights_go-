// /clubs/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import BottomNav from '@/components';
import Link from 'next/link';
import shared from '@styles/auth.module.css';
import styles from '@styles/clubDashboard.module.css';

interface ClubData {
  id: number;
  club_name: string;
  category: string;
  description: string | null;
  experience_level: number;
  experience_points: number;
  locations: string[];
}

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  location: string;
  registered_count: number;
  checked_in_count: number;
}

export default function ClubDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState<ClubData | null>(null);
  const [clubRep, setClubRep] = useState<{ first_name: string; last_name: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/clubs/login');
      return;
    }
    fetchClubData();
  }, [user]);

  async function fetchClubData() {
    const supabase = createClient();

    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, user_type')
        .eq('user_id', user.id)
        .single();

      if (userError) throw userError;

      if (userData.user_type !== 'club_rep') {
        router.push('/login');
        return;
      }

      setClubRep({ first_name: userData.first_name, last_name: userData.last_name });

      // Get club membership
      const { data: membership, error: membershipError } = await supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', userData.id)
        .eq('role', 'club_rep')
        .single();

      if (membershipError) throw membershipError;

      // Get club data
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', membership.club_id)
        .single();

      if (clubError) throw clubError;
      setClub(clubData);

      // Get club events with attendance counts
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(
          `
          *,
          event_attendance (status)
        `,
        )
        .eq('club_id', clubData.id)
        .order('event_date', { ascending: true });

      if (!eventsError && eventsData) {
        const formattedEvents = eventsData.map((event) => ({
          ...event,
          registered_count:
            event.event_attendance?.filter((a: any) => a.status === 'registered').length || 0,
          checked_in_count:
            event.event_attendance?.filter((a: any) => a.status === 'checked_in').length || 0,
        }));
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error('Error fetching club data:', err);
      router.push('/clubs/login');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className={shared.wrapper}>
        <div className={shared.card}>
          <p>Loading club dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>{club?.club_name}</h1>
        <p className={styles.subtitle}>
          Welcome back, {clubRep?.first_name} {clubRep?.last_name}!
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{events.length}</span>
          <span className={styles.statLabel}>Total Events</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>Lv. {club?.experience_level || 1}</span>
          <span className={styles.statLabel}>Club Level</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{club?.experience_points || 0}</span>
          <span className={styles.statLabel}>Club XP</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/clubs/events/create" className={styles.primaryButton}>
          + Create New Event
        </Link>
        <Link href="/clubs/profile/edit" className={styles.secondaryButton}>
          Edit Club Profile
        </Link>
      </div>

      <div className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Your Events</h2>
        {events.length === 0 ? (
          <p className={styles.emptyState}>No events created yet. Create your first event!</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <h3 className={styles.eventName}>{event.event_name}</h3>
              <p className={styles.eventDate}>{new Date(event.event_date).toLocaleDateString()}</p>
              <p className={styles.eventLocation}>{event.location}</p>
              <div className={styles.eventStats}>
                <span>📝 {event.registered_count} registered</span>
                <span>✅ {event.checked_in_count} checked in</span>
              </div>
              <Link href={`/clubs/events/${event.id}/attendees`} className={styles.viewLink}>
                View Attendees →
              </Link>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
