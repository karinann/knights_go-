import dynamic from 'next/dynamic';
import styles from './home/home.module.css';

const MapView = dynamic(() => import('../components/Map/MapView'), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div className={styles.page}>
      <MapView />
    </div>
  );
}
