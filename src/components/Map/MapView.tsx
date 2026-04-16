import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import type { Event } from '../services/index.ts';

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
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div style={{ width: '75%', height: '100%' }}>
        {/* Loading / error banners — sit above the map */}
        {loading && <div style={bannerStyle('#f0f4ff', '#1565C0')}>Loading events…</div>}
        {error && <div style={bannerStyle('#fff0f0', '#c62828')}>Error: {error}</div>}

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
            <Marker key={event.id} position={[event.latitude!, event.longitude!]} icon={customIcon}>
              <Popup>
                <div>
                  <h3>{event.event_name}</h3>
                  <p>{event.location ?? 'Location TBD'}</p>
                  <p>
                    {event.event_date ? new Date(event.event_date).toLocaleString() : 'Time TBD'}
                  </p>
                  <button onClick={() => saveEvent(event)}>Save Event</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Saved Events Sidebar ─────────────────────────────────────────── */}
      <div
        style={{
          width: '25%',
          height: '100%',
          padding: '16px',
          borderLeft: '10px solid #3a593aff',
          backgroundColor: '#5c9d61ff',
          color: '#ffffffff',
          overflowY: 'auto',
        }}
      >
        <h2>Saved Events</h2>

        {savedEvents.length === 0 ? (
          <p>No saved events yet.</p>
        ) : (
          savedEvents.map((savedEvent) => (
            <div
              key={savedEvent.id}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#2b693aff',
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ margin: '0 0 4px 0' }}>{savedEvent.event_name}</h3>
              <p style={{ margin: '0', fontSize: '14px' }}>
                {savedEvent.location ?? 'Location TBD'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
                {savedEvent.event_date
                  ? new Date(savedEvent.event_date).toLocaleString()
                  : 'Time TBD'}
              </p>

              <button
                onClick={() => removeEvent(savedEvent.id)}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#C8E6C9',
                  color: '#2E7D32',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>

              <button
                onClick={() => goToEvent(savedEvent.id)}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  marginLeft: '6px',
                  backgroundColor: '#E3F2FD',
                  color: '#1565C0',
                  cursor: 'pointer',
                }}
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Small helper so the loading/error banners don't clutter the JSX
function bannerStyle(bg: string, color: string): React.CSSProperties {
  return {
    position: 'absolute',
    zIndex: 1000,
    top: 8,
    left: 8,
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: bg,
    color,
    fontSize: '13px',
  };
}

export default MapView;
