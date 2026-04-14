import dynamic from 'next/dynamic';
import BottomNav from '@/components';
import styles from '../styles/home.module.css';
import styles2 from '../../styles/BottomNav.module.css';



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
    <BottomNav />
    </div>
  );
}
