import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// map Component yay; syntax function name (){ return (jsx stuff ); }
// center is ucf coordinates,

function MapView() {
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={[28.6024, -81.2005]}
      zoom={30}
      scrollWheelZoom
      style={{ height: '1000px', width: '1000px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      var marker = L.marker([28.6024,-81.2005]).addTo(map);
      <Marker position={[28.6024, -81.2005]} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapView;
