// /clubs/signup.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useClubs } from '@/hooks/useClubs';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import styles from '@styles/clubSignup.module.css';

const CATEGORIES = [
  'cultural',
  'academic',
  'greek life',
  'special interest',
  'volunteer',
  'other',
] as const;

export default function ClubSignupPage() {
  const router = useRouter();
  const { createClub, loading: clubLoading } = useClubs({ autoFetch: false });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    clubName: '',
    location: '',
    category: 'cultural' as const,
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const supabase = createClient();

    try {
      // 1. Create auth account for the club representative
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Failed to create account');

      // 2. Insert the club representative into users table (like student signup)
      const { error: userError } = await supabase.from('users').insert({
        user_id: authData.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        user_type: 'club_rep', // Different from 'student'
      });

      if (userError) throw userError;

      // 3. Get the user's internal ID
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (userDataError) throw userDataError;

      // 4. Create the club using your existing createClub from useClubs
      const club = await createClub({
        club_name: formData.clubName,
        locations: [formData.location],
        category: formData.category,
        description: formData.description || null,
        created_by: userData.id,
        experience_level: 1,
        experience_points: 0,
      });

      if (!club) throw new Error('Failed to create club');

      // 5. Create club membership for the club rep
      const { error: membershipError } = await supabase.from('club_memberships').insert({
        user_id: userData.id,
        club_id: club.id,
        role: 'club_rep', // Give them club_rep role
      });

      if (membershipError) throw membershipError;

      // 6. Sign in the club rep automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Redirect to club dashboard
      router.push('/clubs/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <div className={shared.avatar}>
            <Image src="/icons/knights-go-logo.png" alt="Knights Go" width={80} height={80} />
          </div>
          <h1 className={shared.title}>Register Your Club</h1>
          <p className={shared.subtitle}>Create a club account on Knights Go</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Club Representative Info */}
          <div className={styles.sectionTitle}>Club Representative Info</div>

          <div className={shared.field}>
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="clubrep@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Club Info */}
          <div className={styles.sectionTitle}>Club Information</div>

          <div className={shared.field}>
            <label>Club Name *</label>
            <input
              type="text"
              name="clubName"
              placeholder="e.g., Filipino Student Association"
              value={formData.clubName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Location *</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., UCF, Student Union Room 101"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className={shared.field}>
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={shared.field}>
            <label>Description (Optional)</label>
            <textarea
              name="description"
              placeholder="Tell students what your club is about..."
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}

          <button type="submit" className={shared.button} disabled={loading || clubLoading}>
            {loading || clubLoading ? 'Creating Club Account...' : 'Create Club Account'}
          </button>
        </form>

        <div className={shared.footer}>
          <p>
            Already have a club account? <Link href="/clubs/login">Log in</Link>
          </p>
          <p>
            <Link href="/">Back to home</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
