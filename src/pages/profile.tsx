import { useState } from 'react';
import { useRouter } from 'next/router'; // ← pages/ uses next/router, not next/navigation
import shared from '@styles/auth.module.css';
import createClient from 'lib/supabase';
import Image from 'next/image';
import BottomNav from '@/components';

export default function LoginPage() {
  // const [current state value, function used to update value]
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    supabase.auth.updateUser({ password }).then(({ error: updateError }) => {
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setLoading(false);
    });
  };

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          <div className={shared.avatar}>
            <Image src="/icons/knights-go-logo.png" alt="Knights Go" width={200} height={200} />
          </div>
          <h1 className={shared.title}>Profile</h1>
        </div>

        <form onSubmit={handleSubmit}>
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
            {loading ? 'Updating Information...' : 'Save Changes'}
          </button>
        </form>
      </div>
      <BottomNav />
    </main>
  );
}
