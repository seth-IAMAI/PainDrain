'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ConditionSummaryDialogProps {
  icd10Code: string;
  additional_description: string;
  onClose: () => void;
}

export function ConditionSummaryDialog({ icd10Code, additional_description, onClose }: ConditionSummaryDialogProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // AI functionality removed.
        setSummary(additional_description);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMsg);
        toast({
            title: "Could not fetch summary",
            description: errorMsg,
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [icd10Code, toast]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Condition Summary: {icd10Code}</DialogTitle>
          <DialogDescription>AI-generated summary of potential conditions. This is not medical advice.</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Generating summary...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-4 font-semibold">Failed to load summary</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          )}
          {summary && <p className="text-sm text-foreground whitespace-pre-wrap">{summary}</p>}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
