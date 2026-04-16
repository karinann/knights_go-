import { useState } from 'react';
import Image from 'next/image';
import createClient from 'lib/supabase';
import { useAuth } from 'context/AuthContext';
import styles from '../styles/wardrobe.module.css';

type Category = 'hat' | 'shirt' | 'wand';

type Gear = {
  hat: string | null;
  shirt: string | null;
  wand: string | null;
};

type Props = {
  previewGear: Gear;
  setPreviewGear: React.Dispatch<React.SetStateAction<Gear>>;
  onClose: () => void;
};

// each item has a url and the minimum level required to unlock it
// level 0 = available from the start
interface WardrobeItem {
  url: string;
  label: string;
  requiredLevel: number;
}

// TEMP mock data — replace with backend fetch once endpoints are ready
// requiredLevel: 0 = starter item, available to everyone
const ITEMS: Record<Category, WardrobeItem[]> = {
  hat: [
    { url: '/items/flowercrown.png', label: 'Flower crown', requiredLevel: 0 },
    { url: '/items/crown.png', label: 'Crown', requiredLevel: 3 },
  ],
  shirt: [{ url: '/items/shirt1.png', label: 'Basic shirt', requiredLevel: 0 }],
  wand: [{ url: '/items/wand1.png', label: 'Wand', requiredLevel: 2 }],
};

const TABS: { key: Category; label: string }[] = [
  { key: 'hat', label: 'Hats' },
  { key: 'shirt', label: 'Shirts' },
  { key: 'wand', label: 'Wands' },
];

export default function Wardrobe({ previewGear, setPreviewGear, onClose }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Category>('hat');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // user's current level — used to determine which items are unlocked
  // TODO: pull this from profile once save endpoint is ready
  const userLevel = 1;

  function handleSelect(category: Category, url: string) {
    // toggle off if already selected, otherwise select it
    setPreviewGear((prev) => ({
      ...prev,
      [category]: prev[category] === url ? null : url,
    }));
  }

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

    // save the equipped items to the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        mon_hat_url: previewGear.hat,
        mon_shirt_url: previewGear.shirt,
        mon_wand_url: previewGear.wand,
      })
      .eq('id', userData.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onClose();
  }

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
        {ITEMS[activeTab].map((item) => {
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
              onClick={() => isUnlocked && handleSelect(activeTab, item.url)}
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
              {/* lock icon overlay for locked items */}
              {!isUnlocked && (
                <div className={styles.lockOverlay}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 11V7C7 4.239 9.239 2 12 2C14.761 2 17 4.239 17 7V11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
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
        <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Exit'}
        </button>
        <button type="button" className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
