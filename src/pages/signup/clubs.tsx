import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import createClient from 'lib/supabase';
import Link from 'next/link';
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

export default function ClubCategoriesPage() {
  const router = useRouter();
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // save the selected clubs to user's data
  async function handleConfirm() {
    if (!user) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

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

    // get selected clubs from localStorage
    const saved = localStorage.getItem('selectedClubs');
    const selectedClubs: { id: number; category: string }[] = saved ? JSON.parse(saved) : [];

    // insert a membership row for each selected club
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

    // clear localStorage
    localStorage.removeItem('selectedClubs');
    router.push('/signup/knightselector');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        {/* Header */}
        <div className={shared.header}>
          <h1 className={shared.title}>What clubs are you interested in?</h1>
          <p className={styles.hint}>Select as many as you like</p>
        </div>

        {/* list of categories */}
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              // go to selected categories page
              href={`/signup/clubs/${encodeURIComponent(cat)}`}
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

        {/* display and save number of clubs selected */}
        {totalSelected > 0 && (
          <div className={styles.confirmSection}>
            <p className={styles.selectedCount}>{totalSelected} clubs selected</p>
            {error && <p className={shared.error}>{error}</p>}
            <button
              type="button"
              className={shared.button}
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Next'}
            </button>
          </div>
        )}

        {/* skip club selection */}
        <div className={shared.footer}>
          <Link href="/signup/knightselector" className={styles.skip}>
            Skip for now
          </Link>
        </div>
      </div>
    </main>
  );
}
