import { Scanner } from '@yudiel/react-qr-scanner';

function qr(){
  const handleScan = (detectedCodes: any[]) => {console.log('Detected codes:', detectedCodes);
     // detectedCodes is an array of IDetectedBarcode objects
      detectedCodes.forEach(code=> {console.log('Format: ${code.format}, Value: ${code.rawValue}'); 
    }); 
  };


return ( 
  <Scanner
  onScan={(codes) => {
    codes.forEach(code => {
      console.log("QR:", code.rawValue);
    });
  }}
  onError={(err) => console.error(err)}
  constraints={{
    facingMode: "environment",
  }}
/>
); 
}

export default qr;