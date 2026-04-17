'use client';

import { useState } from 'react';
import { EventAttendanceService } from '@/services/event.attendance.service';
import { QRScanner } from '../components/qr/qr_code';
import styles from '../styles/home.module.css';
import BottomNav from '../components/BottomNav';

export default function ScanPage() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const attendanceService = new EventAttendanceService();

  const handleScan = async (qrValue: string) => {
    if (processing) return;

    setProcessing(true);
    setResult(null);

    try {
      // Parse the QR data
      let eventId: number;
      let qrData: any;

      try {
        qrData = JSON.parse(qrValue);
        eventId = qrData.eventId;
      } catch {
        // If not JSON, try simple format "event_123"
        if (qrValue.startsWith('event_')) {
          eventId = parseInt(qrValue.split('_')[1], 10);
        } else {
          throw new Error('Invalid QR code format');
        }
      }

      // Validate it's an event check-in QR
      if (qrData.type && qrData.type !== 'event_checkin') {
        throw new Error('This QR code is not for event check-in');
      }

      // Perform check-in
      const res = await attendanceService.checkInEvent(eventId);

      // Build success message
      let successMessage = `✅ Checked in successfully! Earned ${res.xpAwarded.newTotalXP} XP`;
      if (res.xpAwarded.leveledUp) {
        successMessage += `\n🎉 Level up! Now level ${res.xpAwarded.newLevel}! 🎉`;
        if (res.xpAwarded.newTitle) {
          successMessage += `\n🏆 You are now a ${res.xpAwarded.newTitle}!`;
        }
      }

      setResult({ success: true, message: successMessage });
    } catch (error: any) {
      console.error('Check-in error:', error);
      setResult({
        success: false,
        message: `❌ Check-in failed: ${error.message}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Scanner error occurred';
    setResult({
      success: false,
      message: `❌ Scanner error: ${errorMessage}`,
    });
  };

  const resetScanner = () => {
    setResult(null);
    setProcessing(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.scannerContainer}>
        <h1 className={styles.title}>Event Check-in</h1>
        <p className={styles.subtitle}>Scan the event QR code to check in and earn XP</p>

        {!result?.success && (
          <div className={styles.scannerWrapper}>
            <QRScanner
              onScanSuccess={handleScan}
              onScanError={handleError}
              paused={processing || !!result?.success}
            />
          </div>
        )}

        {result && (
          <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
            <div className={styles.resultMessage}>{result.message}</div>
            <button onClick={resetScanner} className={styles.resetButton}>
              {result.success ? 'Scan Another QR' : 'Try Again'}
            </button>
          </div>
        )}

        {processing && (
          <div className={styles.processing}>
            <div className={styles.spinner} />
            <p>Processing check-in...</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
