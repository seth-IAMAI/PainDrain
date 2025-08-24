'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Activity, Calendar as CalendarIcon, Info, BookUser, Plus, Frown } from 'lucide-react';
import { StoredPainEntry, JournalLog } from '@/lib/types';


interface PainHistoryProps {
    entries: StoredPainEntry[];
    setEntries: (entries: StoredPainEntry[] | ((prev: StoredPainEntry[]) => StoredPainEntry[])) => void;
}

export function PainHistory({ entries, setEntries }: PainHistoryProps) {
  const [journalNotes, setJournalNotes] = useState<Record<string, string>>({});

  const handleNoteChange = (entryId: string, value: string) => {
    setJournalNotes(prev => ({ ...prev, [entryId]: value }));
  };

  const handleAddLog = (entryId: string) => {
    const note = journalNotes[entryId];
    if (!note) return;

    const newLog: JournalLog = {
      id: `log_${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      notes: note,
    };

    setEntries(prevEntries => {
        return prevEntries.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    journalLogs: [...entry.journalLogs, newLog]
                };
            }
            return entry;
        });
    });

    setJournalNotes(prev => ({ ...prev, [entryId]: '' }));
  };
  
  if (!entries || entries.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity /> Pain History & Journal
          </CardTitle>
          <CardDescription>
            Review your past pain entries and add follow-up notes to track your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <Frown className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">No History Yet</h3>
                <p className="mt-2">Your timeline is empty. Submit a "New Entry" to start tracking your pain.</p>
            </div>
        </CardContent>
       </Card>
    )
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity /> Pain History & Journal
          </CardTitle>
          <CardDescription>
            Review your past pain entries and add follow-up notes to track your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue={entries[0]?.id}>
            {entries.map((entry) => (
              <AccordionItem value={entry.id} key={entry.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                                <p className="font-semibold capitalize">{entry.painInput.bodyParts.join(', ').replace(/-/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <Badge variant={entry.painInput.intensity > 6 ? 'destructive' : entry.painInput.intensity > 3 ? 'secondary' : 'outline'}>
                            Intensity: {entry.painInput.intensity}/10
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  {/* AI Analysis Section */}
                  <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
                      <h4 className="font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Original AI Analysis</h4>
                      <p className="text-sm text-muted-foreground italic">"{entry.painInput.description}"</p>
                      <Separator />
                      <p className="text-sm"><span className="font-medium">Medical Summary:</span> {entry.analysisResult.medicalTranslation}</p>
                      {entry.analysisResult.diagnosticSuggestions?.[0] && <p className="text-sm"><span className="font-medium">Top Suggestion:</span> {entry.analysisResult.diagnosticSuggestions[0].diagnosis} ({entry.analysisResult.diagnosticSuggestions[0].icd10Code})</p>}
                  </div>
                  
                  {/* Journaling Section */}
                  <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
                    <h4 className="font-semibold flex items-center gap-2"><BookUser className="h-5 w-5 text-primary" />Follow-up Journal</h4>
                     {entry.journalLogs.length > 0 ? (
                        <div className="space-y-3 pl-6 border-l-2 border-primary/50">
                            {entry.journalLogs.map(log => (
                                <div key={log.id} className="text-sm relative">
                                    <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                                    <p className="font-medium text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                                    <p>{log.notes}</p>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-sm text-muted-foreground pl-7">No journal entries yet. Add one below!</p>
                     )}

                    <div className="pt-4 space-y-2">
                        <Textarea 
                            placeholder="How are you feeling now? Any new triggers or relief?" 
                            value={journalNotes[entry.id] || ''}
                            onChange={(e) => handleNoteChange(entry.id, e.target.value)}
                        />
                        <Button size="sm" onClick={() => handleAddLog(entry.id)} disabled={!journalNotes[entry.id]}>
                            <Plus className="mr-2 h-4 w-4" /> Add Log
                        </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
