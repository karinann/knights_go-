import { useState } from 'react';
import { useClubs } from '@/hooks/useClubs';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import styles from './clubform.module.css';

const CATEGORIES = [
  'cultural',
  'academic',
  'greek life',
  'special interest',
  'volunteer',
  'other',
] as const;

export default function ClubFormPage() {
  const { createClub, loading, error } = useClubs({ autoFetch: false });

  const [clubName, setClubName] = useState<string>('');
  const [locations, setLocations] = useState<string>('');
  const [category, setCategory] = useState<string>('cultural');
  const [description, setDescription] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    setFormError(null);

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setFormError('You must be logged in. Go to /login first.');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (userError || !userData) {
      setFormError('Could not find your user profile.');
      return;
    }

    // bypass the service entirely — insert directly
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        club_name: clubName,
        locations: [locations],
        category,
        description: description || null,
        created_by: userData.id,
        experience_level: 1,
        experience_points: 0,
      })
      .select()
      .single();

    if (clubError) {
      setFormError(clubError.message);
      return;
    }

    if (club) {
      setSuccess(`Club "${club.club_name}" created!`);
      setClubName('');
      setLocations('');
      setCategory('Cultural');
      setDescription('');
    }
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <h1 className={shared.title}>Create Club</h1>
          <p className={shared.subtitle}>Dev tool — not visible to users</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Club name *</label>
            <input
              type="text"
              placeholder="e.g. Filipino Student Association"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Location *</label>
            <input
              type="text"
              placeholder="e.g. UCF"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description of the club..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {formError && <p className={shared.error}>{formError}</p>}
          {error && <p className={shared.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" className={shared.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Club'}
          </button>
        </form>

        <div className={shared.footer}>
          <p>
            <a href="/home">Back to app</a>
          </p>
        </div>
      </div>
    </main>
  );
}
