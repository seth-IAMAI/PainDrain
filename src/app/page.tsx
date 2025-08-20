'use client';
import { useState } from 'react';
import { Header } from '@/components/painsribe/Header';
import { PainInputForm } from '@/components/painsribe/PainInputForm';
import { MedicalOutputDashboard } from '@/components/painsribe/MedicalOutputDashboard';

export default function Home() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex items-start justify-center">
        <div className="w-full grid gap-8 md:grid-cols-2 items-start">
          <div className={result || isLoading || error ? 'md:col-span-1' : 'md:col-span-2 flex justify-center'}>
            <div className="w-full max-w-xl">
              {!isSubmitted && (
                <PainInputForm
                  setResult={setResult}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  setIsSubmitted={setIsSubmitted}
                />
              )}
              {(isLoading || error) && isSubmitted && (
                <MedicalOutputDashboard
                  result={null}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>
          </div>
          {result && !isLoading && !error && (
            <>
                <div className="w-full max-w-xl">
                    <PainInputForm
                      setResult={setResult}
                      setIsLoading={setIsLoading}
                      setError={setError}
                      isLoading={isLoading}
                      setIsSubmitted={setIsSubmitted}
                      isSubmitted={isSubmitted}
                    />
                </div>
                <MedicalOutputDashboard
                    result={result}
                    isLoading={isLoading}
                    error={error}
                />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
