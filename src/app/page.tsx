'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PainInputForm } from '@/components/painscribe/PainInputForm';
import { MedicalOutputDashboard } from '@/components/painscribe/MedicalOutputDashboard';
import { SplashScreen } from '@/components/painscribe/SplashScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PainHistory } from '@/components/painscribe/PainHistory';

export default function Home() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("entry");


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      setActiveTab("analysis");
    }
  }, [isSubmitted]);

  const handleNewEntry = () => {
    setIsSubmitted(false);
    setResult(null);
    setError(null);
    setActiveTab("entry");
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-200 text-foreground">
        <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <Image
                        src="/paindrain-logo.png"
                        alt="PainDrain Logo"
                        width={32}
                        height={32}
                    />
                    <h1 className="text-xl font-bold">PainDrain</h1>
                </div>
                 <Button onClick={handleNewEntry} variant={activeTab === 'entry' ? 'default' : 'outline'}>
                    <PlusCircle className="mr-2" />
                    New Entry
                </Button>
            </div>
        </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="entry">New Entry</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!isSubmitted}>Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="entry">
              <PainInputForm
                setResult={setResult}
                setIsLoading={setIsLoading}
                setError={setError}
                isLoading={isLoading}
                setIsSubmitted={setIsSubmitted}
                isSubmitted={isSubmitted}
              />
          </TabsContent>

          <TabsContent value="analysis">
              <MedicalOutputDashboard
                  result={result}
                  isLoading={isLoading}
                  error={error}
              />
          </TabsContent>
            <TabsContent value="timeline">
                <PainHistory />
            </TabsContent>
         </Tabs>
      </main>
    </div>
  );
}
