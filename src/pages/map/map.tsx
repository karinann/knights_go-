import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('../../../../../../../jaetr/knights_go--1/src/components/Map/MapView'),
  {
    ssr: false,
  },
);

export default function MapPage() {
  return (
    <div>
      <MapView />
    </div>
  );
}
