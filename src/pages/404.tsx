import styles from '@styles/404.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Page Not Found</h2>

      <p className={styles.text}>The page you are looking for does not exist.</p>

      <a href="/" className={styles.link}>
        Go Home
      </a>
    </div>
  );
}
