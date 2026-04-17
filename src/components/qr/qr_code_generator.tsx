'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Install: npm install qrcode.react
import { EventService } from '../../services/events.service';

interface EventQRCodeProps {
  eventId: number;
  eventName: string;
}

export default function EventQRCode({ eventId, eventName }: EventQRCodeProps) {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const eventService = new EventService();
        const data = await eventService.generateEventQRCode(eventId);
        setQrData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [eventId]);

  if (loading) return <div>Generating QR Code...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-lg font-bold mb-2">{eventName} Check-in QR</h3>
      <QRCodeSVG value={qrData} size={200} />
      <p className="text-sm text-gray-600 mt-2">Have members scan this QR code to check in</p>
    </div>
  );
}
