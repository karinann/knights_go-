import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { clubService } from '@/services/clubs.service';
import type { Club } from '@/types/database.types';
import type { ClubCategory } from '../clubs';
import shared from '@styles/auth.module.css';
import styles from './category.module.css';

const MOCK_CLUBS: Club[] = [
  {
    id: 1,
    club_name: 'Girls Who Code',
    category: 'Academic',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
  {
    id: 2,
    club_name: 'Pre-Med Society',
    category: 'Academic',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
  {
    id: 3,
    club_name: 'Computer Science Club',
    category: 'Academic',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
  {
    id: 4,
    club_name: 'Filipino Student Association',
    category: 'Cultural',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
  {
    id: 5,
    club_name: 'Vietnamese Student Union',
    category: 'Cultural',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
  {
    id: 6,
    club_name: 'Best Buddies',
    category: 'Volunteer',
    locations: ['UCF'],
    description: null,
    created_by: 1,
    created_at: '',
    experience_level: 1,
    experience_points: 0,
    logo_url: null,
    member_ids: null,
    sprite_url: null,
  },
];

const PAGE_SIZE = 20;

export default function ClubCategoryPage() {
  const router = useRouter();
  const category = router.query.category as ClubCategory;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

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
    setLoading(true);

    // TODO: replace with real service call once db is seeded
    // filter by current category and search term
    const filtered = MOCK_CLUBS.filter((c) => c.category === category).filter((c) =>
      search ? c.club_name.toLowerCase().includes(search.toLowerCase()) : true,
    );

    setClubs((prev) => (reset ? filtered : [...prev, ...filtered]));
    setHasMore(false); // no pagination needed for mock data
    setLoading(false);

    /*
    setLoading(true);
    const data = await clubService.getAllClubsByParam({
      category: category as Club['category'],
      club_name: search || undefined,
      limit: PAGE_SIZE,
      offset: currentOffset,
    });

    setClubs((prev) => (reset ? data : [...prev, ...data]));
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false); 
    */
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

    let updated;
    if (isSelected) {
      updated = all.filter((c) => c.id !== club.id);
      setSelectedIds((prev) => prev.filter((id) => id !== club.id));
    } else {
      updated = [...all, { id: club.id, category }];
      setSelectedIds((prev) => [...prev, club.id]);
    }

    localStorage.setItem('selectedClubs', JSON.stringify(updated));
  }

  function handleDone() {
    router.push('/signup/clubs');
  }

  return (
    <main className={styles.page}>
      {/* header */}
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

      {/* search */}
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

      {/* club list */}
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

      {/* done button */}
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
