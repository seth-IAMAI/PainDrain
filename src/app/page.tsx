'use client';
import { useState } from 'react';
import { PainInputForm } from '@/components/painscribe/PainInputForm';
import { MedicalOutputDashboard } from '@/components/painscribe/MedicalOutputDashboard';

export default function Home() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-blue-200 text-foreground">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-center">

          {/* Always display the PainInputForm */}
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

          {/* Conditionally display the MedicalOutputDashboard */}
          {isSubmitted && (
            <div className="w-full max-w-xl">
                <MedicalOutputDashboard
                    result={result}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
          )}
         </div>
      </main>
    </div>
  );
}
