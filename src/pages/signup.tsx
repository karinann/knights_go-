import { useState } from 'react';
import { useRouter } from 'next/router';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // create the authenticaiton account
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // inserts users into table
    const { error: dbError } = await supabase.from('users').insert({
      user_id: data.user?.id,
      first_name: firstName,
      last_name: lastName,
      email,
      user_type: 'student',
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // go to club picker
    router.push('/signup/clubs');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <div className={shared.avatar}>
            <Image src="/icons/knights-go-logo.png" alt="Knights Go" width={100} height={100} />
          </div>
          <p className={shared.subtitle}>Upload Profile Image</p>
          <h1 className={shared.title}>Create Account</h1>
        </div>

        <form onSubmit={handleSignup}>
          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>First name</label>
            <input
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Last name</label>
            <input
              type="text"
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Email</label>
            <input
              type="email"
              placeholder="janesmith@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}

          <button type="submit" className={shared.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Next'}
          </button>
        </form>

        <div className={shared.footer}>
          <p>
            Already have an account? <Link href="/login/">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
