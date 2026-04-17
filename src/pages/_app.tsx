import type { AppProps } from 'next/app';
import 'leaflet/dist/leaflet.css';
import '@styles/globals.css';
import { AuthProvider } from 'context/AuthContext';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
