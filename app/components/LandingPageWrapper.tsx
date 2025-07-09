'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for Three.js components in a client component
const CollegeChatLanding = dynamic(
  () => import('./CollegeChatLanding'),
  { ssr: false }
);

export default function LandingPageWrapper() {
  return <CollegeChatLanding />;
}
