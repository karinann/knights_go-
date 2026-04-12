import { useState, useEffect } from 'react';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import styles from './clubform.module.css';

interface ClubOption {
  id: number;
  club_name: string;
}

export default function EventFormPage() {
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [baseXp, setBaseXp] = useState<string>('50');
  const [clubId, setClubId] = useState<string>('');
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // fetch all clubs for dropdown on load
  useEffect(() => {
    async function fetchClubs() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clubs')
        .select('id, club_name')
        .order('club_name', { ascending: true });

      if (!error && data) {
        setClubs(data);
        if (data.length > 0) setClubId(String(data[0].id));
      }
    }
    fetchClubs();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    setFormError(null);
    setLoading(true);

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setFormError('You must be logged in. Go to /login first.');
      setLoading(false);
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        event_name: eventName,
        event_date: new Date(eventDate).toISOString(),
        description: description || null,
        location: location || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        base_xp: parseInt(baseXp, 10),
        club_id: parseInt(clubId, 10),
      })
      .select()
      .single();

    if (eventError) {
      setFormError(eventError.message);
      setLoading(false);
      return;
    }

    if (event) {
      setSuccess(`Event "${event.event_name}" created!`);
      setEventName('');
      setEventDate('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setBaseXp('50');
      if (clubs.length > 0) setClubId(String(clubs[0].id));
    }

    setLoading(false);
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <h1 className={shared.title}>Create Event</h1>
          <p className={shared.subtitle}>Dev tool — not visible to users</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Event name *</label>
            <input
              type="text"
              placeholder="e.g. Weekly Meeting"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Club *</label>
            {clubs.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-body)' }}>
                No clubs found — create one at <a href="/dev/clubform">/dev/clubform</a> first
              </p>
            ) : (
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className={styles.select}
                required
              >
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.club_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Date and time *</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. BA 105"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Latitude *</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 28.6024"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Longitude *</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -81.2001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Base XP reward</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={baseXp}
              onChange={(e) => setBaseXp(e.target.value)}
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description of the event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {formError && <p className={shared.error}>{formError}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" className={shared.button} disabled={loading || clubs.length === 0}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>

        <div className={shared.footer}>
          <p>
            <a href="/dev/clubform">Club form</a>
            {' · '}
            <a href="/home">Back to app</a>
          </p>
        </div>
      </div>
    </main>
  );
}
