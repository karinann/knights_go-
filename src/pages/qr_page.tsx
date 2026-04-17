import dynamic from 'next/dynamic'; 
import BottomNav from '@/components'; 
import styles from '../styles/home.module.css'; 
import styles2 from '../../styles/BottomNav.module.css'; 
import { useState } from "react";

const Scanner = dynamic( () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner), { ssr: false } );

export default function qr_page() {
  return (
    <div className={styles.page}>
      <div className={styles.scannerWrapper}>
        <Scanner
          onScan={(codes) => {
            codes.forEach(code => console.log(code.rawValue));
          }}
          constraints={{ facingMode: "environment" }}
        />
        <div className={styles.overlay} />
        <div className={styles.scanBox} />
      </div>

      <BottomNav />
    </div>
  );
}