import type { AppProps } from 'next/app';
import '@styles/globals.css';
import { AuthProvider } from 'context/AuthContext';
import 'leaflet/dist/leaflet.css';
import {Scanner} from '@yudiel/react-qr-scanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
