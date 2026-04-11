import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import shared from '@styles/auth.module.css';
import styles from '@styles/clubs.module.css';

const CATEGORIES = [
  'Cultural',
  'Academic',
  'Greek Life',
  'Special Interest',
  'Volunteer',
  'Other',
] as const;

export type ClubCategory = (typeof CATEGORIES)[number];

export default function ClubCategoriesPage() {
  const router = useRouter();
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});

  // read selections from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('selectedClubs');
    if (!saved) return;

    const parsed: { id: number; category: string }[] = JSON.parse(saved);

    // count how many clubs selected per category
    const counts: Record<string, number> = {};
    parsed.forEach((club) => {
      counts[club.category] = (counts[club.category] ?? 0) + 1;
    });
    setSelectedCounts(counts);
  }, []);

  const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0);

  async function handleConfirm() {
    // TODO: save to club_memberships then clear localStorage
    localStorage.removeItem('selectedClubs');
    router.push('/signup/knightselector');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <h1 className={shared.title}>What clubs are you interested in?</h1>
          <p className={styles.hint}>Select as many as you like</p>
        </div>

        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
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

        {totalSelected > 0 && (
          <div className={styles.confirmSection}>
            <p className={styles.selectedCount}>{totalSelected} clubs selected</p>
            <button type="button" className={shared.button} onClick={handleConfirm}>
              Next
            </button>
          </div>
        )}

        <div className={shared.footer}>
          <Link href="/signup/knightselector" className={styles.skip}>
            Skip for now
          </Link>
        </div>
      </div>
    </main>
  );
}
