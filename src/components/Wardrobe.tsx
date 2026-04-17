import { useState } from 'react';
import Image from 'next/image';
import createClient from 'lib/supabase';
import { useAuth } from 'context/AuthContext';
import styles from '../styles/wardrobe.module.css';
import { useUsers } from '@/hooks/useUsers';

type Category = 'base' | 'hat' | 'shirt' | 'wand';

type Gear = {
  base: string | null;
  baseId: string | null;
  hat: string | null;
  shirt: string | null;
  wand: string | null;
};

type UserProfile = {
  mon_url: string | null;
  mon_hat_url: string | null;
  mon_shirt_url: string | null;
  mon_wand_url: string | null;
};

type Props = {
  previewGear: Gear;
  setPreviewGear: React.Dispatch<React.SetStateAction<Gear>>;
  profile: UserProfile | null;
  userLevel: number;
  onClose: () => void;
};

// each item has a url and the minimum level required to unlock it
// level 0 = available from the start
interface WardrobeItem {
  id: string;
  url: string;
  label: string;
  requiredLevel: number;
  characterId?: string;
}

// TEMP mock data — replace with backend fetch once endpoints are ready
// requiredLevel: 0 = starter item, available to everyone
const ITEMS: Record<Category, WardrobeItem[]> = {
  base: [
    {
      id: 'knight1',
      url: '/icons/knight1.png',
      label: 'Poor Guy dont got a name yet',
      requiredLevel: 0,
    },
    { id: 'knight2', url: '/icons/knight2.png', label: 'Jimothy', requiredLevel: 0 },
    { id: 'knight3', url: '/icons/knight3.png', label: 'Timothy', requiredLevel: 0 },
  ],
  hat: [
    {
      id: 'flowercrown',
      url: '/items/knight1/knight1-flowercrown.png',
      label: 'Flower crown',
      requiredLevel: 0,
      characterId: 'knight1',
    },
    {
      id: 'flowercrown',
      url: '/items/knight2/flowercrown.png',
      label: 'Flower crown',
      requiredLevel: 0,
      characterId: 'knight2',
    },
    {
      id: 'flowercrown',
      url: '/items/knight3/knight3-flowercrown.png',
      label: 'Flower crown',
      requiredLevel: 0,
      characterId: 'knight3',
    },
  ],
  shirt: [
    {
      id: 'gwcshirt',
      url: '/items/knight1/knight1-gwcshirt.png',
      label: 'GWC Shirt',
      requiredLevel: 0,
      characterId: 'knight1',
    },
    {
      id: 'gwcshirt',
      url: '/items/knight2/knight2-gwcshirt.png',
      label: 'GWC Shirt',
      requiredLevel: 0,
      characterId: 'knight2',
    },
    {
      id: 'gwcshirt',
      url: '/items/knight3/knight3-shirt.png',
      label: 'GWC Shirt',
      requiredLevel: 0,
      characterId: 'knight3',
    },
  ],
  wand: [
    {
      id: 'staff',
      url: '/items/knight1/knight1-staff.png',
      label: 'Staff',
      requiredLevel: 0,
      characterId: 'knight1',
    },
    {
      id: 'staff',
      url: '/items/knight2/knight2-staff.png',
      label: 'Staff',
      requiredLevel: 0,
      characterId: 'knight2',
    },
    {
      id: 'staff',
      url: '/items/knight3/knight3-staff.png',
      label: 'Staff',
      requiredLevel: 0,
      characterId: 'knight3',
    },
    {
      id: 'badge',
      url: '/items/knight1/knight1-badge.png',
      label: 'UCF Badge',
      requiredLevel: 2,
      characterId: 'knight1',
    },
    {
      id: 'badge',
      url: '/items/knight2/knight2-badge.png',
      label: 'UCF Badge',
      requiredLevel: 2,
      characterId: 'knight2',
    },
    {
      id: 'badge',
      url: '/items/knight3/knight3-badge.png',
      label: 'UCF Badge',
      requiredLevel: 2,
      characterId: 'knight3',
    },
  ],
};

const TABS: { key: Category; label: string }[] = [
  { key: 'base', label: 'Knight' },
  { key: 'hat', label: 'Hats' },
  { key: 'shirt', label: 'Shirts' },
  { key: 'wand', label: 'Hand' },
];

export default function Wardrobe({
  previewGear,
  setPreviewGear,
  profile,
  userLevel,
  onClose,
}: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Category>('hat');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateMonBaseUrl, updateMonHatUrl, updateMonShirtUrl, updateMonWandUrl } = useUsers({
    autoFetch: false,
  });

  // user's current level — used to determine which items are unlocked
  // TODO: pull this from profile once save endpoint is ready
  //   const userLevel = 1;

  function handleSelect(category: Category, item: WardrobeItem) {
    setPreviewGear((prev) => {
      if (category === 'base') {
        return {
          ...prev,
          base: item.url,
          baseId: item.id,
          hat: null, // reset incompatible items
          shirt: null,
          wand: null,
        };
      }

      return {
        ...prev,
        [category]: prev[category] === item.url ? null : item.url,
      };
    });
  }

  async function handleSave() {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // First get DB user id (IMPORTANT)
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Could not find your profile.');
      }

      const userId = userData.id;

      // Update all gear
      await Promise.all([
        updateMonBaseUrl(userId, previewGear.base ?? ''),
        updateMonHatUrl(userId, previewGear.hat ?? ''),
        updateMonShirtUrl(userId, previewGear.shirt ?? ''),
        updateMonWandUrl(userId, previewGear.wand ?? ''),
      ]);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const filteredItems = ITEMS[activeTab].filter((item) => {
    if (activeTab === 'base') return true;

    if (!previewGear.baseId) return true; // show all if no base selected yet

    return item.characterId === previewGear.baseId;
  });

  return (
    <div className={styles.container}>
      {/* header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Knight Closet</h2>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* category tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* items grid */}
      <div className={styles.grid}>
        {filteredItems.map((item) => {
          const isUnlocked = userLevel >= item.requiredLevel;
          const isEquipped = previewGear[activeTab] === item.url;

          return (
            <button
              key={item.url}
              type="button"
              className={`
          ${styles.itemButton}
          ${isEquipped ? styles.itemEquipped : ''}
          ${!isUnlocked ? styles.itemLocked : ''}
        `}
              onClick={() => isUnlocked && handleSelect(activeTab, item)}
              disabled={!isUnlocked}
            >
              <Image
                src={item.url}
                width={80}
                height={80}
                alt={item.label}
                className={!isUnlocked ? styles.itemImageLocked : styles.itemImage}
              />
              <span className={styles.itemLabel}>{item.label}</span>

              {!isUnlocked && (
                <div className={styles.lockOverlay}>
                  {/* lock svg */}
                  <span>Lv. {item.requiredLevel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => {
            if (profile) {
              setPreviewGear({
                base: profile.mon_url,
                baseId: null,
                hat: profile.mon_hat_url,
                shirt: profile.mon_shirt_url,
                wand: profile.mon_wand_url,
              });
            }
            onClose();
          }}
        >
          Cancel
        </button>
        <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Exit'}
        </button>
      </div>
    </div>
  );
}
