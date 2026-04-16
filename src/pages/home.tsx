import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import BottomNav from '@/components';
import Wardrobe from '@components/Wardrobe';
import { useUsers } from '@/hooks/useUsers';
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
  experience_points: number | null;
  experience_level: number | null;
  club_ids: string[] | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [eventsAttended, setEventsAttended] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const { getMonUrls } = useUsers({ autoFetch: false });

  const [previewGear, setPreviewGear] = useState<{
    base: string | null;
    hat: string | null;
    shirt: string | null;
    wand: string | null;
  }>({
    base: null,
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
        hat: profile.mon_hat_url,
        shirt: profile.mon_shirt_url,
        wand: profile.mon_wand_url,
      });
    }
  }, [profile]);

  async function fetchData() {
    const supabase = createClient();

    // fetch user profile
    const { data: profileData } = await supabase
      .from('users')
      .select(
        'first_name, mon_url, mon_shirt_url, mon_hat_url, mon_wand_url, experience_points, experience_level, club_ids',
      )
      .eq('user_id', user?.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      // also fetch mon urls through the hook to keep things in sync
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (userData) {
        const monUrls = await getMonUrls(userData.id);
        setPreviewGear({
          base: monUrls.mon_url,
          hat: monUrls.mon_hat_url,
          shirt: monUrls.mon_shirt_url,
          wand: monUrls.mon_wand_url,
        });
      }
    }

    // fetch user profile
    // const { data: profileData } = await supabase
    //   .from('users')
    //   .select(
    //     'first_name, mon_url, mon_shirt_url, mon_hat_url, mon_wand_url, experience_points, experience_level, club_ids',
    //   )
    //   .eq('user_id', user?.id)
    //   .single();

    // if (profileData) setProfile(profileData);

    // fetch next upcoming event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (eventData) setNextEvent(eventData);

    // fetch number of events attended by this user
    const { count } = await supabase
      .from('event_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    setEventsAttended(count ?? 0);
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

  const xp = profile?.experience_points ?? 0;
  const level = profile?.experience_level ?? 1;
  const xpIntoLevel = xp % 100;
  const xpPercent = Math.round((xpIntoLevel / 100) * 100);
  const clubCount = profile?.club_ids?.length ?? 0;

  return (
    <div className={styles.page}>
      {/* backdrop image + knight + top buttons */}
      <div className={styles.backdropSection}>
        {/* top buttons: knight wardrobe, qr code scanner */}
        <div className={styles.topBar}>
          <div onClick={() => setShowWardrobe(true)} className={styles.iconButton}>
            <Image src="/icons/closet.png" alt="Closet" width={35} height={35} />
          </div>
          {/* <Link href="/profile/knight" className={styles.iconButton}>
            <Image src="/icons/closet.png" alt="Closet" width={35} height={35} />
          </Link> */}
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
          {/* {profile?.mon_url && (
            <Image
              src={profile.mon_url}
              alt="Your knight"
              width={350}
              height={350}
              className={styles.knightImage}
              priority
            />
          )} */}
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
          {/* <div className={styles.knightWrapper}></div> */}

          {/* xp bar sits just below knight */}
          <div className={styles.xpSection}>
            <div className={styles.xpLabel}>
              <span className={styles.levelBadge}>Lv. {level}</span>
              <span className={styles.xpText}>{xpIntoLevel} / 100 XP</span>
            </div>
            <div className={styles.xpBarTrack}>
              <div className={styles.xpBarFill} style={{ width: `${xpPercent}%` }} />
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
            userLevel={profile?.experience_level ?? 1}
            onClose={() => setShowWardrobe(false)}
          />
        ) : loading ? (
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
