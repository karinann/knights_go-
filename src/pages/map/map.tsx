import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('../../components/Map/MapView'), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div>
      <MapView />
    </div>
  );
}
