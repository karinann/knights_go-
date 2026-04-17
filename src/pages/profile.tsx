import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import shared from '@styles/auth.module.css';
import createClient from 'lib/supabase';
import Image from 'next/image';
import BottomNav from '@/components';
import { useAuth } from 'context/AuthContext';
import { useUsers } from '@/hooks/useUsers';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  mon_url: string | null;
  mon_shirt_url: string | null;
  mon_hat_url: string | null;
  mon_wand_url: string | null;
  experience_points: number;
  experience_level: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);
  const [updatingName, setUpdatingName] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { getMonUrls } = useUsers({ autoFetch: false });

  const [previewGear, setPreviewGear] = useState<{
    base: string | null;
    hat: string | null;
    shirt: string | null;
    wand: string | null;
  }>({
    base: null,
    hat: null,
    shirt: null,
    wand: null,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPreviewGear({
        base: profile.mon_url,
        hat: profile.mon_hat_url,
        shirt: profile.mon_shirt_url,
        wand: profile.mon_wand_url,
      });
    }
  }, [profile]);

  async function fetchProfile() {
    const supabase = createClient();

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select(
        'first_name, last_name, email, mon_url, mon_shirt_url, mon_hat_url, mon_wand_url, experience_points, experience_level',
      )
      .eq('user_id', user?.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setError('Failed to load profile');
      return;
    }

    if (profileData) {
      setProfile(profileData);

      // Get the latest mon URLs through the hook
      const monUrls = await getMonUrls();
      setPreviewGear({
        base: monUrls.mon_url,
        hat: monUrls.mon_hat_url,
        shirt: monUrls.mon_shirt_url,
        wand: monUrls.mon_wand_url,
      });
    }

    setLoading(false);
  }

  async function handleNameUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setUpdatingName(true);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('user_id', user?.id);

    if (updateError) {
      setError(updateError.message);
      setUpdatingName(false);
      return;
    }

    // Update local profile state
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            first_name: firstName,
            last_name: lastName,
          }
        : null,
    );

    setSuccessMessage('Name updated successfully!');
    setUpdatingName(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setUpdatingPassword(true);

    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setUpdatingPassword(false);
      return;
    }

    setSuccessMessage('Password updated successfully!');
    setPassword('');
    setUpdatingPassword(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  function getInitials() {
    if (!profile) return '?';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  }

  if (loading) {
    return (
      <main className={shared.wrapper}>
        <div className={shared.card}>
          <p className={shared.hint}>Loading profile...</p>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className={shared.wrapper}>
      <div className={shared.card}>
        <div className={shared.header}>
          {/* Customized Character Avatar */}
          <div className={shared.avatarContainer}>
            <div className={shared.characterAvatar}>
              {previewGear.base && (
                <div className={shared.characterLayers}>
                  <Image
                    src={previewGear.base}
                    alt="Character base"
                    width={120}
                    height={120}
                    className={shared.avatarLayer}
                  />
                  {previewGear.shirt && (
                    <Image
                      src={previewGear.shirt}
                      alt="Character shirt"
                      width={120}
                      height={120}
                      className={shared.avatarLayer}
                    />
                  )}
                  {previewGear.hat && (
                    <Image
                      src={previewGear.hat}
                      alt="Character hat"
                      width={120}
                      height={120}
                      className={shared.avatarLayer}
                    />
                  )}
                  {previewGear.wand && (
                    <Image
                      src={previewGear.wand}
                      alt="Character wand"
                      width={120}
                      height={120}
                      className={shared.avatarLayer}
                    />
                  )}
                </div>
              )}
              {!previewGear.base && (
                <div className={shared.avatarPlaceholder}>
                  <span className={shared.initials}>{getInitials()}</span>
                </div>
              )}
            </div>
            {/* <button className={shared.editAvatarButton} onClick={() => router.push('/')}>
              Edit Character
            </button> */}
          </div>

          <h1 className={shared.title}>Profile</h1>
          <p className={shared.userEmail}>{profile?.email}</p>
          {/* Stats Section */}
          <div className={shared.statsSection}>
            <div className={shared.statBox}>
              <span className={shared.statValue}>{profile?.experience_level || 1}</span>
              <span className={shared.statLabel}>Level</span>
            </div>
            <div className={shared.statDivider} />
            <div className={shared.statBox}>
              <span className={shared.statValue}>{profile?.experience_points || 0}</span>
              <span className={shared.statLabel}>Total XP</span>
            </div>
          </div>
        </div>

        {/* Update Name Form */}
        <form onSubmit={handleNameUpdate}>
          <div className={shared.nameFields}>
            <div className={shared.field}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className={shared.field}>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={shared.secondaryButton} disabled={updatingName}>
            {updatingName ? 'Updating Name...' : 'Update Name'}
          </button>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordUpdate}>
          <div className={shared.field}>
            <label htmlFor="password">Change Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className={shared.error}>{error}</p>}
          {successMessage && <p className={shared.success}>{successMessage}</p>}

          <button type="submit" className={shared.button} disabled={updatingPassword || !password}>
            {updatingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className={shared.footer}>
          <button
            className={shared.logoutButton}
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push('/login');
            }}
          >
            Log Out
          </button>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
