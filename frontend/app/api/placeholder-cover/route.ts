import { NextRequest, NextResponse } from 'next/server';

const COLORS: Array<[string, string]> = [
  ['#1a0b2e', '#7c3aed'],
  ['#0f172a', '#0ea5e9'],
  ['#2d1b1b', '#dc2626'],
  ['#1a2818', '#16a34a'],
  ['#2d1b2e', '#c026d3'],
  ['#1b1f2d', '#f59e0b'],
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title') || 'Hell';
  const [c1, c2] = COLORS[hashString(title) % COLORS.length];

  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const svg = `<svg width="480" height="640" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
    </filter>
  </defs>
  <rect width="480" height="640" fill="url(#g)"/>
  <rect width="480" height="640" filter="url(#n)"/>
  <text x="240" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="120" font-weight="900" fill="rgba(255,255,255,0.92)" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}