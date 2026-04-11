import { useState } from 'react';
import { useRouter } from 'next/router';
import createClient from 'lib/supabase';
import shared from '@styles/auth.module.css';

export default function SignupPage() {
  const router = useRouter();

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <h1 className={shared.title}>What clubs are you interested in?</h1>
      </div>
    </main>
  );
}
