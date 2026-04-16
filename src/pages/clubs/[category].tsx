import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useClubs } from '@/hooks/useClubs';
import type { Club } from '@/services';
import shared from '@styles/auth.module.css';
import type { ClubCategory } from '../manageclubs';
import styles from '../signup/clubs/category.module.css';

const PAGE_SIZE = 20;

export default function ClubCategoryPage() {
  const router = useRouter();
  const category = router.query.category as ClubCategory;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // use the hook with autoFetch off since we control fetching manually
  const { getAllClubsByParams, loading } = useClubs({ autoFetch: false });

  // load existing selections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedClubs');
    if (!saved) return;
    const parsed: { id: number; category: string }[] = JSON.parse(saved);
    const idsForThisCategory = parsed.filter((c) => c.category === category).map((c) => c.id);
    setSelectedIds(idsForThisCategory);
  }, [category]);

  // fetch clubs when category or search changes
  useEffect(() => {
    if (!category) return;
    setOffset(0);
    setClubs([]);
    fetchClubs(0, true);
  }, [category, search]);

  async function fetchClubs(currentOffset: number, reset = false) {
    const data = await getAllClubsByParams({
      category: category as Club['category'],
      club_name: search || undefined,
      limit: PAGE_SIZE,
      offset: currentOffset,
    });

    setClubs((prev) => (reset ? data : [...prev, ...data]));
    setHasMore(data.length === PAGE_SIZE);
  }

  function loadMore() {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchClubs(newOffset);
  }

  function toggleClub(club: Club) {
    const saved = localStorage.getItem('selectedClubs');
    const all: { id: number; category: string }[] = saved ? JSON.parse(saved) : [];

    const isSelected = selectedIds.includes(club.id);

    const updated = isSelected
      ? all.filter((c) => c.id !== club.id)
      : [...all, { id: club.id, category }];

    setSelectedIds((prev) =>
      isSelected ? prev.filter((id) => id !== club.id) : [...prev, club.id],
    );

    localStorage.setItem('selectedClubs', JSON.stringify(updated));
  }

  function handleDone() {
    router.push('/manageclubs');
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push('/signup/clubs')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <h1 className={styles.title}>{category}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.searchWrapper}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.searchIcon}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M16.5 16.5L21 21"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder={`Search ${category} clubs...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        {search.length > 0 && (
          <button type="button" className={styles.clearSearch} onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.list}>
        {clubs.map((club) => {
          const isSelected = selectedIds.includes(club.id);
          return (
            <button
              key={club.id}
              type="button"
              className={isSelected ? styles.clubRowSelected : styles.clubRow}
              onClick={() => toggleClub(club)}
            >
              <span className={styles.clubName}>{club.club_name}</span>
              <div className={isSelected ? styles.checkActive : styles.check}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}

        {loading && <p className={styles.hint}>Loading clubs...</p>}

        {!loading && clubs.length === 0 && (
          <p className={styles.hint}>No clubs found{search ? ` for "${search}"` : ''}</p>
        )}

        {!loading && hasMore && (
          <button type="button" className={styles.loadMore} onClick={loadMore}>
            Load more
          </button>
        )}
      </div>

      <div className={styles.footer}>
        {selectedIds.length > 0 && (
          <p className={styles.selectedCount}>
            {selectedIds.length} selected in {category}
          </p>
        )}
        <button type="button" className={shared.button} onClick={handleDone}>
          Done
        </button>
      </div>
    </main>
  );
}
