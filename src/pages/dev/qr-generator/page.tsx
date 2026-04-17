// app/dev/qr-generator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import QRCode, { QRCodeSVG } from 'qrcode.react';
import { EventService } from '../../../services/events.service';
import { EventAttendanceService } from '../../../services/event.attendance.service';
import type { Event } from '../../../types/types';
import createClient from '../../../../lib/supabase';

interface Club {
  id: number;
  club_name: string;
  logo_url: string | null;
}

export default function QRGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [qrData, setQrData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const [activeView, setActiveView] = useState<'clubs' | 'events' | 'qr'>('clubs');

  const eventService = new EventService();
  const attendanceService = new EventAttendanceService();

  // Fetch user's clubs on component mount
  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = await (eventService as any).getCurrentUserId();

      const { data: memberships, error: membershipError } = await (eventService as any).supabase
        .from('club_memberships')
        .select(
          `
          clubs:club_id (
            id,
            club_name,
            logo_url
          )
        `,
        )
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      if (memberships) {
        const clubList = memberships.map((m: any) => m.clubs).filter((c: any) => c);
        setClubs(clubList);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubEvents = async (clubId: number) => {
    setLoading(true);
    setError('');
    setEvents([]);
    setSelectedEventId(null);

    try {
      const clubEvents = await eventService.getClubEvents(clubId);
      setEvents(clubEvents);
      setActiveView('events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = (clubId: number) => {
    setSelectedClubId(clubId);
    fetchClubEvents(clubId);
  };

  const handleEventSelect = (eventId: number) => {
    setSelectedEventId(eventId);
    generateQRCode(eventId);
  };

  const generateQRCode = async (eventId: number) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setQrData('');

    try {
      const selectedEvent = events.find((e) => e.id === eventId);

      const qrPayload = {
        eventId: eventId,
        eventName: selectedEvent?.event_name,
        clubId: selectedClubId,
        type: 'event_checkin',
        timestamp: Date.now(),
        version: '1.0',
      };

      setQrData(JSON.stringify(qrPayload));
      setSuccess('QR Code generated successfully!');
      setActiveView('qr');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testScan = () => {
    if (!qrData) {
      setError('No QR code to scan');
      return;
    }

    try {
      const parsed = JSON.parse(qrData);
      setScanResult(JSON.stringify(parsed, null, 2));

      if (confirm(`Test check-in for event ID: ${parsed.eventId}?`)) {
        testCheckIn(parsed.eventId);
      }
    } catch (err: any) {
      setScanResult(`Error parsing QR: ${err.message}`);
    }
  };

  const testCheckIn = async (eventId: number) => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError('You must be logged in. Go to /login first.');
        return;
      }

      const result = await attendanceService.checkInEvent(eventId);
      setSuccess(`✅ Checked in successfully! Earned ${result.xpAwarded.amount} XP`);
      if (result.xpAwarded.leveledUp) {
        setSuccess((prev) => `${prev}\n🎉 Level up! Now level ${result.xpAwarded.newLevel}! 🎉`);
      }
    } catch (err: any) {
      setError(`Check-in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `event_${selectedEventId}_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const reset = () => {
    setActiveView('clubs');
    setSelectedClubId(null);
    setSelectedEventId(null);
    setQrData('');
    setScanResult('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for event check-in</p>
        </div>
        {activeView !== 'clubs' && (
          <button onClick={reset} className="text-blue-500 hover:text-blue-700">
            ← Start Over
          </button>
        )}
      </div>

      {/* Step 1: Select Club */}
      {activeView === 'clubs' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Select Your Club</h2>

          {loading && clubs.length === 0 ? (
            <p>Loading clubs...</p>
          ) : clubs.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-2">
                No clubs found. Make sure you're a member of at least one club.
              </p>
              <button
                onClick={fetchMyClubs}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh Clubs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => handleClubSelect(club.id)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left transition"
                >
                  <div className="font-medium">{club.club_name}</div>
                  <div className="text-sm text-gray-500">ID: {club.id}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Event */}
      {activeView === 'events' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Event</h2>

          {loading && events.length === 0 ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No events found for this club.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventSelect(event.id)}
                  className="w-full p-4 border rounded-lg hover:bg-gray-50 text-left transition"
                >
                  <div className="font-medium">{event.event_name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleString()} | Base XP: {event.base_xp || 10}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: QR Code Display */}
      {activeView === 'qr' && qrData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: QR Code</h2>

          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
              <QRCodeSVG
                id="qr-code-canvas"
                value={qrData}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={downloadQRCode}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Download PNG
              </button>
              <button
                onClick={testScan}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Scan & Check-In
              </button>
            </div>

            <div className="mt-6 w-full">
              <h3 className="font-medium mb-2">QR Data:</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(JSON.parse(qrData), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {scanResult && activeView === 'qr' && (
        <div className="mt-6 bg-gray-50 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {scanResult}
          </pre>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded whitespace-pre-wrap">
          {success}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Loading...
        </div>
      )}
    </div>
  );
}
