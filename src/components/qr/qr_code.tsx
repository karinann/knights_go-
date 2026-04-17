'use client';

import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: unknown) => void;
  paused?: boolean;
}

// eslint-disable-next-line import/prefer-default-export
export function QRScanner({ onScanSuccess, onScanError, paused = false }: QRScannerProps) {
  const handleScan = (detectedCodes: any[]) => {
    if (paused) return;

    const code = detectedCodes[0];
    if (code && code.rawValue) {
      onScanSuccess(code.rawValue);
    }
  };

  const handleError = (error: unknown) => {
    onScanError?.(error);
  };

  return (
    <Scanner
      onScan={handleScan}
      onError={handleError}
      constraints={{
        facingMode: 'environment',
        aspectRatio: 1,
      }}
    />
  );
}
