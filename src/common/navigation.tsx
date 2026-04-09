import Image from 'next/image';

const bottomNavigation = [
  {
    id: 1,
    label: 'Profile',
    href: '/profile',
    icon: <Image src="/icons/person.png" alt="Profile" width={25} height={25} />,
  },
  {
    id: 2,
    label: 'Events',
    href: '/events',
    icon: <Image src="/icons/Calendar.png" alt="Events" width={25} height={25} />,
  },
  {
    id: 3,
    label: 'Home',
    href: '/home',
    icon: <Image src="/icons/Home.png" alt="Home" width={25} height={25} />,
  },
  {
    id: 4,
    label: 'Map',
    href: '/map',
    icon: <Image src="/icons/Map pin.png" alt="Map" width={25} height={25} />,
  },
  {
    id: 5,
    label: 'QR Code',
    href: '/qr/scan',
    icon: <Image src="/icons/qr-icon.png" alt="QR Code Scanner" width={25} height={25} />,
  },
];

export { bottomNavigation };
