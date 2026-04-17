import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import BottomNav from '@/components';
import Wardrobe from '@components/Wardrobe';
import { useUsers } from '@/hooks/useUsers';
import { useXPLevelUp } from '@/hooks/useXPLevelUp';
import styles from '../styles/home.module.css';

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  description: string;
  club_id: number;
}

interface UserProfile {
  first_name: string;
  mon_url: string | null;
  mon_shirt_url: string | null;
  mon_hat_url: string | null;
  mon_wand_url: string | null;
}

interface XpInfoState {
  currentXP: number;
  currentLevel: number;
  currentTitle: string | null;
  currentLevelMinXP: number;
  currentLevelMaxXP: number | null;
  nextLevel: number | null;
  nextTitle: string | null;
  xpNeededForNextLevel: number | null;
  progressToNextLevel: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [eventsAttended, setEventsAttended] = useState<number>(0);
  const [clubCount, setClubCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [xpInfo, setXpInfo] = useState<XpInfoState>({
    currentXP: 0,
    currentLevel: 1,
    currentTitle: null,
    currentLevelMinXP: 0,
    currentLevelMaxXP: 100,
    nextLevel: null,
    nextTitle: null,
    xpNeededForNextLevel: 100,
    progressToNextLevel: 0,
  });

  const { getMonUrls } = useUsers({ autoFetch: false });
  const { getUserLevelInfo, loading: xpLoading } = useXPLevelUp({ autoFetch: false });

  const [previewGear, setPreviewGear] = useState<{
    base: string | null;
    baseId: string | null;
    hat: string | null;
    shirt: string | null;
    wand: string | null;
  }>({
    base: null,
    baseId: null,
    hat: null,
    shirt: null,
    wand: null,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setPreviewGear({
        base: profile.mon_url,
        baseId: null,
        hat: profile.mon_hat_url,
        shirt: profile.mon_shirt_url,
        wand: profile.mon_wand_url,
      });
    }
  }, [profile]);

  // Fetch XP info when userId is available
  useEffect(() => {
    async function fetchXPInfo() {
      if (userId) {
        try {
          const info = await getUserLevelInfo(userId);
          setXpInfo({
            currentXP: info.currentXP,
            currentLevel: info.currentLevel,
            currentTitle: info.currentTitle,
            currentLevelMinXP: info.currentLevelMinXP,
            currentLevelMaxXP: info.currentLevelMaxXP,
            nextLevel: info.nextLevel,
            nextTitle: info.nextTitle,
            xpNeededForNextLevel: info.xpNeededForNextLevel,
            progressToNextLevel: info.progressToNextLevel,
          });
        } catch (err) {
          console.error('Failed to fetch XP info:', err);
        }
      }
    }
    fetchXPInfo();
  }, [userId, getUserLevelInfo]);

  async function fetchData() {
    const supabase = createClient();

    // First get the user's internal ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      setLoading(false);
      return;
    }

    const internalUserId = userData.id;
    setUserId(internalUserId);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('users')
      .select('first_name, mon_url, mon_shirt_url, mon_hat_url, mon_wand_url')
      .eq('user_id', user?.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Fetch mon urls through the hook to keep things in sync
      const monUrls = await getMonUrls();
      setPreviewGear({
        base: monUrls.mon_url,
        baseId: null,
        hat: monUrls.mon_hat_url,
        shirt: monUrls.mon_shirt_url,
        wand: monUrls.mon_wand_url,
      });
    }

    // Fetch club count from club_memberships table
    const { count: clubMembershipCount, error: clubError } = await supabase
      .from('club_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', internalUserId);

    if (clubError) {
      console.error('Error fetching club count:', clubError);
    } else {
      setClubCount(clubMembershipCount ?? 0);
    }

    // Fetch next upcoming event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (eventData) setNextEvent(eventData);

    // Fetch number of events attended by this user (checked in events only)
    const { count: attendanceCount, error: attendanceError } = await supabase
      .from('event_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', internalUserId)
      .eq('status', 'checked_in');

    if (attendanceError) {
      console.error('Error fetching attendance count:', attendanceError);
    } else {
      setEventsAttended(attendanceCount ?? 0);
    }

    setLoading(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Use XP info from the hook
  const level = xpInfo.currentLevel;
  const xpNeeded = xpInfo.xpNeededForNextLevel;
  const progressPercent = xpInfo.progressToNextLevel;
  const currentTitle = xpInfo.currentTitle;
  const nextTitle = xpInfo.nextTitle;

  return (
    <div className={styles.page}>
      {/* backdrop image + knight + top buttons */}
      <div className={styles.backdropSection}>
        {/* top buttons: knight wardrobe, qr code scanner */}
        <div className={styles.topBar}>
          <div onClick={() => setShowWardrobe(true)} className={styles.iconButton}>
            <Image src="/icons/closet.png" alt="Closet" width={35} height={35} />
          </div>
          <Link href="/qr/scan" className={styles.iconButton}>
            <Image src="/icons/qr-icon.png" alt="QR Code Scanner" width={20} height={20} />
          </Link>
        </div>

        {/* backdrop image */}
        <Image
          src="/icons/home-backdrop.png"
          alt="Background"
          width={400}
          height={500}
          className={styles.backdrop}
          priority
        />

        {/* knight overlaid on backdrop */}
        <div className={styles.knightOverlay}>
          {previewGear.base && (
            <>
              <Image
                src={previewGear.base}
                width={350}
                height={350}
                className={styles.knightImage}
                alt="base"
              />
              {previewGear.shirt && (
                <Image
                  src={previewGear.shirt}
                  width={350}
                  height={350}
                  className={styles.layer}
                  alt="shirt"
                />
              )}
              {previewGear.hat && (
                <Image
                  src={previewGear.hat}
                  width={350}
                  height={350}
                  className={styles.layer}
                  alt="hat"
                />
              )}
              {previewGear.wand && (
                <Image
                  src={previewGear.wand}
                  width={350}
                  height={350}
                  className={styles.layer}
                  alt="wand"
                />
              )}
            </>
          )}

          {/* xp bar sits just below knight */}
          <div className={styles.xpSection}>
            <div className={styles.xpLabel}>
              <span className={styles.levelBadge}>
                Lv. {level} {currentTitle && `- ${currentTitle}`}
              </span>
              <span className={styles.xpText}>
                {xpNeeded && xpNeeded > 0
                  ? `${xpNeeded} XP to ${nextTitle || 'next level'}`
                  : 'Max level!'}
              </span>
            </div>
            <div className={styles.xpBarTrack}>
              <div
                className={styles.xpBarFill}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* parchment card */}
      <div className={styles.card}>
        {showWardrobe ? (
          <Wardrobe
            previewGear={previewGear}
            setPreviewGear={setPreviewGear}
            profile={profile}
            userLevel={level}
            onClose={() => setShowWardrobe(false)}
          />
        ) : loading || xpLoading ? (
          <p className={styles.hint}>Loading...</p>
        ) : (
          <>
            {/* next event */}
            <p className={styles.sectionLabel}>Next event</p>
            {nextEvent ? (
              <div className={styles.eventCard}>
                <p className={styles.eventName}>{nextEvent.event_name}</p>
                <p className={styles.eventMeta}>{formatDate(nextEvent.event_date)}</p>
                {nextEvent.description && (
                  <p className={styles.eventMeta}>{nextEvent.description}</p>
                )}
              </div>
            ) : (
              <p className={styles.hint}>No upcoming events right now</p>
            )}

            {/* stats */}
            <p className={styles.sectionLabel}>Your stats</p>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p className={styles.statNumber}>{clubCount}</p>
                <p className={styles.statLabel}>Clubs joined</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statNumber}>{eventsAttended}</p>
                <p className={styles.statLabel}>Events attended</p>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
