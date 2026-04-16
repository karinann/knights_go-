import dynamic from 'next/dynamic';
import styles from '../styles/home.module.css';
import BottomNav from '@/components';

const MapView = dynamic(() => import('../components/Map/MapView'), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div className={styles.page}>
      <MapView />
      <BottomNav />
    </div>
  );
}
