import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import styles from '@styles/clubs.module.css';

const CATEGORIES = [
  'cultural',
  'academic',
  'greek life',
  'special interest',
  'volunteer',
  'other',
] as const;

export type ClubCategory = (typeof CATEGORIES)[number];

export default function ManageClubsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // load existing selections from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('selectedClubs');
    if (!saved) return;
    const parsed: { id: number; category: string }[] = JSON.parse(saved);
    const counts: Record<string, number> = {};
    parsed.forEach((club) => {
      counts[club.category] = (counts[club.category] ?? 0) + 1;
    });
    setSelectedCounts(counts);
  }, []);

  const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    // get user's integer id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData) {
      setError('Could not find your profile.');
      setSaving(false);
      return;
    }

    // get selected club ids from localStorage
    const saved = localStorage.getItem('selectedClubs');
    const selectedClubs: { id: number; category: string }[] = saved ? JSON.parse(saved) : [];

    // delete existing memberships first
    await supabase.from('club_memberships').delete().eq('user_id', userData.id);

    // insert new memberships
    if (selectedClubs.length > 0) {
      const memberships = selectedClubs.map((club) => ({
        user_id: userData.id,
        club_id: club.id,
      }));

      const { error: insertError } = await supabase.from('club_memberships').insert(memberships);

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    localStorage.removeItem('selectedClubs');
    router.push('/events');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => router.push('/events')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h1 className={shared.title}>Manage Club Interests</h1>
          </div>
          <p className={styles.hint}>Select as many as you like</p>
        </div>

        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/clubs/${encodeURIComponent(cat)}`}
              className={styles.categoryRow}
            >
              <span className={styles.categoryName}>{cat}</span>
              <div className={styles.categoryRight}>
                {selectedCounts[cat] > 0 && (
                  <span className={styles.badge}>{selectedCounts[cat]}</span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {error && <p className={shared.error}>{error}</p>}

        <div className={styles.confirmSection}>
          {totalSelected > 0 && (
            <p className={styles.selectedCount}>{totalSelected} clubs selected</p>
          )}
          <button type="button" className={shared.button} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Back to Events'}
          </button>
        </div>

        <div className={shared.footer}>
          <Link href="/events" className={styles.skip}>
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
