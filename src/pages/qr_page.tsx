import dynamic from 'next/dynamic';
import styles from '../styles/home.module.css';


const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
);


export default function qr_page() {
  return (
    <div className={styles.page}>
      <Scanner
      onScan={(result) => console.log(result)}
    />
    </div>
  );
}
