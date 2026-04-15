import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import { useAuth } from 'context/AuthContext';
import styles from '@styles/knights.module.css';

const KNIGHTS = [
  { id: 1, name: 'Knight 1', src: '/icons/knight1.png', src2: '/icons/knight1-cropped.png' },
  { id: 2, name: 'Knight 2', src: '/icons/knight2.png', src2: '/icons/knight2-cropped.png' },
  { id: 3, name: 'Knight 3', src: '/icons/knight3.png', src2: '/icons/knight3-cropped.png' },
];

export default function KnightSelectorPage() {
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const selectedKnight = KNIGHTS[current];

    const { error: dbError } = await supabase
      .from('users')
      .update({ mon_url: selectedKnight.src })
      .eq('user_id', user?.id);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    router.push('/home');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <h1 className={shared.title}> Choose Your Knight!</h1>
        </div>

        {/* Large Preview */}
        <div className={styles.previewContainer}>
          <Image
            src={KNIGHTS[current].src}
            alt={KNIGHTS[current].name}
            width={400}
            height={400}
            className={styles.previewImage}
          />
        </div>

        {/* Small previews */}
        <div className={styles.thumbnails}>
          {KNIGHTS.map((k, i) => (
            <button
              key={k.id}
              type="button"
              className={i === current ? styles.thumbActive : styles.thumb}
              onClick={() => setCurrent(i)}
            >
              <Image
                src={k.src2}
                alt={k.name}
                width={60}
                height={60}
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>

        {error && <p className={shared.error}>{error}</p>}

        <button type="button" className={shared.button} onClick={handleConfirm} disabled={loading}>
          {loading ? 'Saving...' : 'Pick Knight!'}
        </button>
      </div>
    </main>
  );
}
