import { useState } from 'react';
import { useRouter } from 'next/router'; // ← pages/ uses next/router, not next/navigation
import shared from '@styles/auth.module.css';
import Image from 'next/image';
import createClient from 'lib/supabase';
import Link from 'next/link';
import styles from '../styles/page.module.css';

export default function LoginPage() {
  // const [current state value, function used to update value]
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push('/home');
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <div className={shared.avatar}>
            <Image src="/icons/knights-go-logo.png" alt="Knights Go" width={200} height={200} />
          </div>
          <h1 className={shared.title}>Profile</h1>
        </div>

        <form onSubmit={handleLogin}>
          <div className={shared.field}>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="password">Change Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}

          <button type="submit" className={shared.button} disabled={loading}>
            {loading ? 'Updating Information...' : 'Done'}
          </button>
        </form>

      </div>
    </main>
  );
}
