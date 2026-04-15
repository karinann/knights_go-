import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import { useMap } from 'react-leaflet';
import BottomNav from '@/components';
import styles from '../../styles/BottomNav.module.css';


// map Component yay; syntax function name (){ return (jsx stuff ); }
// center is ucf coordinates,

type EventItem = {
  id: number
  title: string
  lat: number
  lng: number
  location: string
  time: string
}

function MapView() {
     const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
 })

//Event Data 
     const events: EventItem[] = [
    {
        id: 1,
        title: "Study Night",
        lat: 28.60051,
        lng: -81.20136,
        location: "Library ",
        time: "7:00 PM"
    },
    {
        id: 2,
        title: "Club Meeting",
        lat: 28.6015,
        lng: -81.1990,
        location: "Student Union",
        time: "4:30 PM"
    },
    {
        id: 3,
        title: "Acapella Rehearsal",
        lat: 28.60396,
        lng: -81.20304,
        location: "NSC 110",
        time: "6:00 PM",
    },
    {
        id: 4,
        title: "Wellness Walk",
        lat: 28.6014008429982,
        lng: -81.19617125613097,
        location: "Timothy R. Newman Nature Pavilion in the UCF Arboretum (Parking available across the street at Garage C)",
        time: "8:00 AM",
    },
    {
        id: 5,
        title: "The Impact of Arts Education",
        lat: 28.60271950135273,
        lng: -81.20332458236568,
        location: "VAB 0113",
        time: "1:00 - 2:00 PM",
    },
    {
        id: 6,
        title: "Best Buddies and Knight's Exemplar Spring Banquet",
        lat: 28.598048443308503, 
        lng: -81.20019069925759,
        location: "Live Oak Ballroom",
        time: "6:00 - 8:00 PM",
    },
    {
        id: 7,
        title: "Battle of the RSOs",
        lat: 28.603969509652845,
        lng:  -81.19923111580982,
        location: "Memory Mall",
        time: "6:00 - 9:00 PM",
    },
    {
        id: 8,
        title: "Integration Bee 2026",
        lat: 28.60373423112336, 
        lng: -81.20043913215086,
        location: "Classroom Building 1 Room 320",
        time: "5:00 - 7:30 PM",
  },
];

 const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
 const [mapCenter, setMapCenter] = useState<[number, number]>([28.6024, -81.2005]);

 function saveEvent(event: EventItem) {
   setSavedEvents((prevSavedEvents) => {
     const alreadySaved = prevSavedEvents.some(
       (savedEvent) => savedEvent.id === event.id
     );

     if (alreadySaved) {
       return prevSavedEvents;
     }

     return [...prevSavedEvents, event];
   });
 }

 function removeEvent(id: number) {
   setSavedEvents((prevSavedEvents) =>
     prevSavedEvents.filter((savedEvent) => savedEvent.id !== id)
   );
}

 function ChangeView({ center }: { center: [number, number] }) {
   const map = useMap();
   map.flyTo(center, 18, {
     animate: true,
     duration: 1.2,
   });
   return null;
 }

 function goToEvent(id: number) {
   const foundEvent = events.find((event) => event.id === id);

   if (foundEvent) {
     setMapCenter([foundEvent.lat, foundEvent.lng]);
   }
 }

 return (
   <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
     <div style={{ width: '75%', height: '100%' }}>
       <MapContainer
         center={mapCenter}
         zoom={17}
         scrollWheelZoom={true}
         style={{ height: '100%', width: '100%' }}
       >
         <ChangeView center={mapCenter} />
        <TileLayer
           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />

         {events.map((event) => (
           <Marker
             key={event.id}
             position={[event.lat, event.lng]}
             icon={customIcon}
           >
             <Popup>
               <div>
                 <h3>{event.title}</h3>
                 <p>{event.location}</p>
                 <p>{event.time}</p>
                 <button onClick={() => saveEvent(event)}>Save Event</button>
               </div>
             </Popup>
           </Marker>
         ))}
       </MapContainer>
     </div>

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
   <h3 style={{ margin: '0 0 4px 0' }}>{savedEvent.title}</h3>
   <p style={{ margin: '0', fontSize: '14px' }}>
     {savedEvent.location}
   </p>
   <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
     {savedEvent.time}
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

export default MapView;

