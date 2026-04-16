import { Scanner } from '@yudiel/react-qr-scanner';

function qr() {
  const handleScan = (detectedCodes: any[]) => {
    console.log('Detected codes:', detectedCodes);
    // detectedCodes is an array of IDetectedBarcode objects
    detectedCodes.forEach(code => {
      console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
    });
  };

  return (
    <Scanner
      onScan={handleScan}
      onError={(error) => console.error(error)}
      constraints={{
        facingMode: 'environment',
        aspectRatio: 1,
      }}
    />
  );
}

export default qr;