import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
/* import type { Event } from '../services/index.ts'; */

// EventItem is now just the DB Event type aliased for clarity
type EventItem = Event;

function MapView() {
  const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // ── Swap hardcoded array for live Supabase data ──────────────────────────
  const { events, loading, error } = useEvents({ autoFetch: true });

  const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6024, -81.2005]);

  function saveEvent(event: EventItem) {
    setSavedEvents((prev) => {
      const alreadySaved = prev.some((e) => e.id === event.id);
      return alreadySaved ? prev : [...prev, event];
    });
  }

  function removeEvent(id: number) {
    setSavedEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.flyTo(center, 18, { animate: true, duration: 1.2 });
    return null;
  }

  function goToEvent(id: number) {
    const found = events.find((e) => e.id === id);
    // Only fly if the event actually has coordinates saved
    if (found?.latitude != null && found?.longitude != null) {
      setMapCenter([found.latitude, found.longitude]);
    }
  }

  // ── Filter out events that don't have coordinates yet ───────────────────
  const mappableEvents = events.filter((e) => e.latitude != null && e.longitude != null);

  return (
    <>
      <style>{`
      .customPopup .leaflet-popup-content-wrapper {
        background: #778c5a !important;
        color: #fff !important;
        border-radius: 10px !important;
      }
      .customPopup .leaflet-popup-tip {
        background: #778c5a !important;
      }
    `}</style>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <div style={{ width: '100%', height: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={17}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mappableEvents.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude!, event.longitude!]}
                icon={customIcon}
              >
                <Popup className="customPopup">
                  <div>
                    <h3>{event.event_name}</h3>
                    <p>{event.location ?? 'Location TBD'}</p>
                    <p>
                      {event.event_date ? new Date(event.event_date).toLocaleString() : 'Time TBD'}
                    </p>
                    {/* <button onClick={() => saveEvent(event)}>Save Event</button> */}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}

export default MapView;
