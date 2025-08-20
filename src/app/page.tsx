'use client';
import { useState } from 'react';
import { Header } from '@/components/painsribe/Header';
import { PainInputForm } from '@/components/painsribe/PainInputForm';
import { MedicalOutputDashboard } from '@/components/painsribe/MedicalOutputDashboard';
import type { TranslatePainDescriptionOutput } from '@/ai/flows/translate-pain-description';

export default function Home() {
  const [result, setResult] = useState<TranslatePainDescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <PainInputForm 
            setResult={setResult}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
          />
          <MedicalOutputDashboard 
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}
