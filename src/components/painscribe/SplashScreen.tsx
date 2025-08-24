'use client';

import Image from 'next/image';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out animate-in fade-in">
      <Image
        src="/paindrain-logo.png"
        alt="PainDrain Logo"
        width={200}
        height={200}
        priority
      />
      <div className="mt-4 text-center">
        <p className="text-muted-foreground">Your AI-powered health companion</p>
      </div>
    </div>
  );
}
