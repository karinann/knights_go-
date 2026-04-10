import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/intro.module.css';

// import Page from '@layouts/Page';
// import Section from '@layouts/Section';
// import { Home } from '@components/index';

export default function main(): JSX.Element {
  return (
    <main className={styles.wrapper}>
      <div className={styles.logoSection}>
        <Image src="/icons/knights-go-logo.png" alt="Knights Go" width={350} height={350} />
      </div>

      <div className={styles.actions}>
        <Link href="/login" className={styles.loginButton}>
          Log In
        </Link>

        <p className={styles.signupPrompt}>
          New to Knights Go?{' '}
          <Link href="/signup" className={styles.signupLink}>
            Create an account
          </Link>
        </p>

        <p className={styles.orgPrompt}>
          Registering an organization?{' '}
          <Link href="/signup/org" className={styles.signupLink}>
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
  // return (
  //   <Page title="Home">
  //     <Section>
  //       <Home />
  //     </Section>
  //   </Page>
  // );
}
