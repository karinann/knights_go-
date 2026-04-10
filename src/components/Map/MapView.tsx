import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import BottomNav from '@/components';
import styles from '../../styles/BottomNav.module.css';

// map Component yay; syntax function name (){ return (jsx stuff ); }
// center is ucf coordinates,

function MapView() {
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className={styles.page}>
      <MapContainer
        center={[28.6024, -81.2005]}
        zoom={15}
        scrollWheelZoom
        style={{ height: '100dvh' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[28.6024, -81.2005]} icon={customIcon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
      <BottomNav />
    </div>
  );
}

export default MapView;
