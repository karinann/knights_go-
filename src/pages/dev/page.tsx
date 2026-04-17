// app/dev/page.tsx
import Link from 'next/link';

export default function DevPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>

      <div className="grid gap-4 max-w-md">
        <Link
          href="/dev/qr-generator"
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 text-center"
        >
          🎫 QR Code Generator
        </Link>

        <Link
          href="/dev/event-tester"
          className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 text-center"
        >
          📅 Event Tester
        </Link>

        <Link
          href="/dev/xp-tester"
          className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 text-center"
        >
          ⭐ XP Level Tester
        </Link>
      </div>
    </div>
  );
}
