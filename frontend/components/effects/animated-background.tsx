'use client';

export function AnimatedBackground() {
  return (
    <>
      <div className="noise" />

      <div
        aria-hidden
        className="pointer-events-none fixed -right-32 top-20 z-0 h-96 w-96 rounded-full bg-hell-purple/25 blur-2xl animate-float-slow"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed -left-32 top-1/3 z-0 h-[28rem] w-[28rem] rounded-full bg-hell-violet/20 blur-2xl animate-float-medium"
      />

      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-1/2 z-0 h-80 w-80 rounded-full bg-hell-indigo/22 blur-2xl animate-float-slower"
      />
    </>
  );
}