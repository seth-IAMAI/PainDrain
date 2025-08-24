'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, FileDown, Clipboard, Check, Sparkles } from 'lucide-react';
import { ConditionSummaryDialog } from './ConditionSummaryDialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MedicalOutputDashboardProps {
  result: any | null;
  isLoading: boolean;
  error: string | null;
}

export function MedicalOutputDashboard({ result, isLoading, error }: MedicalOutputDashboardProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<{ icd10Code: string; additional_description: string } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true, 
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = imgHeight / imgWidth;
        
        let newImgWidth = pdfWidth;
        let newImgHeight = newImgWidth * ratio;

        if (newImgHeight > pdfHeight) {
            newImgHeight = pdfHeight;
            newImgWidth = newImgHeight / ratio;
        }

        const x = (pdfWidth - newImgWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', x, 0, newImgWidth, newImgHeight);
        pdf.save('PainDrain-Analysis.pdf');

    } catch (error) {
        console.error("Failed to export to PDF", error);
    } finally {
        setIsExporting(false);
    }
  };


  const getUrgencyBadgeVariant = (urgency: 'low' | 'medium' | 'high' | undefined) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Analyzing your description...</p>
          </div>
        </CardContent>
      );
    }
    if (error) {
      return (
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-destructive p-4">
            <AlertCircle className="h-12 w-12" />
            <p className="mt-4 font-semibold">Analysis Failed</p>
            <p className="text-sm text-center">{error}</p>
          </div>
        </CardContent>
      );
    }
    if (!result) {
        return (
            <CardContent>
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground p-4">
                    <Sparkles className="h-12 w-12 mx-auto text-primary/50" />
                    <p className="mt-4 font-semibold text-lg">Awaiting Input</p>
                    <p>Your translated medical summary will appear here once you provide a description.</p>
                </div>
                </div>
            </CardContent>
      );
    }

    return (
        <CardContent className="space-y-6 pt-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Medical Summary</h3>
              {result.urgencyLevel && <Badge variant={getUrgencyBadgeVariant(result.urgencyLevel)} className="capitalize">{result.urgencyLevel} Urgency</Badge>}
            </div>
          
            <div className="p-4 rounded-lg bg-secondary/50 border border-secondary relative">
              <p className="text-sm">{result.medicalTranslation}</p>
              <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleCopy(result.medicalTranslation, 'summary')}>
                {copiedSection === 'summary' ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            
            {result.diagnosticSuggestions?.length > 0 && <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Diagnostic Suggestions</h3>
                <div className="space-y-4">
                  {result.diagnosticSuggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-background">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-sm">{suggestion.diagnosis} ({suggestion.icd10Code})</p>
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setSelectedDiagnosis({ icd10Code: suggestion.icd10Code, additional_description: suggestion.additional_description })}>Learn more</Button>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={suggestion.confidence} className="w-full h-2" />
                        <span className="text-xs font-bold text-primary">{suggestion.confidence}%</span>
                      </div>
                      {suggestion.description && <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {result.recommendedQuestions?.length > 0 && <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
                  Recommended Questions
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopy(result.recommendedQuestions.join('\n'), 'questions')}>
                    {copiedSection === 'questions' ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.recommendedQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            </>}

            {result.clinicalTerms?.length > 0 && <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">Extracted Clinical Terms</h3>
                <div className="flex flex-wrap gap-2">
                  {result.clinicalTerms.map((term: string, i: number) => <Badge key={i} variant="secondary">{term}</Badge>)}
                </div>
              </div>
            </>}
        </CardContent>
    );
  };

  return (
    <Card className="w-full">
       <div ref={reportRef}>
        <CardHeader>
            <CardTitle className="text-2xl">AI-Powered Medical Analysis</CardTitle>
            <CardDescription>Review the AI-generated insights based on your description.</CardDescription>
        </CardHeader>
        {renderContent()}
      </div>
      {result && !isLoading && (
        <CardFooter>
            <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                {isExporting ? 'Exporting...' : 'Export as PDF'}
            </Button>
        </CardFooter>
      )}
      {selectedDiagnosis && <ConditionSummaryDialog icd10Code={selectedDiagnosis.icd10Code} additional_description={selectedDiagnosis.additional_description} onClose={() => setSelectedDiagnosis(null)} />}
    </Card>
  );
}
