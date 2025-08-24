
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Activity, Calendar as CalendarIcon, MapPin, Info, BookUser, Plus } from 'lucide-react';
import { StoredPainEntry } from '@/lib/types';


const MOCK_STORED_ENTRIES: StoredPainEntry[] = [
  {
    id: 'entry1',
    timestamp: '2024-07-21T10:00:00Z',
    painInput: {
      description: "A sharp, stabbing pain in my lower back that gets worse when I sit for too long. It feels like a hot poker.",
      intensity: 7,
      bodyParts: ['lower-back'],
      painTypes: ['Sharp', 'Stabbing', 'Burning'],
    },
    analysisResult: {
      medicalTranslation: "Patient reports acute, localized pain in the lumbar region, characterized as sharp, stabbing, and radiating heat. Pain is exacerbated by prolonged periods of sitting.",
      diagnosticSuggestions: [{ diagnosis: "Sciatica", icd10Code: "M54.3", confidence: 85 }],
      urgencyLevel: 'medium',
    },
    journalLogs: [
      { id: 'log1', timestamp: '2024-07-21T18:00:00Z', notes: "Took an ibuprofen, pain went down to a 4/10." },
      { id: 'log2', timestamp: '2024-07-22T09:00:00Z', notes: "Woke up feeling stiff, but the sharp pain is gone. It's more of a dull ache now." },
    ]
  },
  {
    id: 'entry2',
    timestamp: '2024-07-23T14:30:00Z',
    painInput: {
      description: "Throbbing headache behind my right eye. It's sensitive to light.",
      intensity: 8,
      bodyParts: ['head'],
      painTypes: ['Throbbing'],
    },
    analysisResult: {
      medicalTranslation: "Patient presents with symptoms consistent with a migraine, including unilateral, pulsating headache localized retro-orbitally and associated photophobia.",
      diagnosticSuggestions: [{ diagnosis: "Migraine with aura", icd10Code: "G43.1", confidence: 92 }],
      urgencyLevel: 'high',
    },
    journalLogs: [
       { id: 'log3', timestamp: '2024-07-23T16:00:00Z', notes: "Tried lying down in a dark room. It helped a little." }
    ]
  },
   {
    id: 'entry3',
    timestamp: '2024-07-26T08:00:00Z',
    painInput: {
      description: "My left knee feels sharp and gives out when I walk up stairs.",
      intensity: 7,
      bodyParts: ['left-leg'],
      painTypes: ['Sharp', 'Stabbing'],
    },
    analysisResult: {
      medicalTranslation: "Patient reports acute pain in the left knee, described as sharp and stabbing, leading to instability, particularly during stair climbing.",
      diagnosticSuggestions: [{ diagnosis: "Meniscus Tear", icd10Code: "S83.2", confidence: 78 }],
      urgencyLevel: 'medium',
    },
    journalLogs: []
  },
];


export function PainHistory() {
  const [journalNotes, setJournalNotes] = useState<Record<string, string>>({});

  const handleNoteChange = (entryId: string, value: string) => {
    setJournalNotes(prev => ({ ...prev, [entryId]: value }));
  };

  const handleAddLog = (entryId: string) => {
    const note = journalNotes[entryId];
    if (!note) return;
    // In a real app, you'd save this to a database.
    console.log(`Adding log for ${entryId}: ${note}`);
    // For now, we just clear the textarea
    setJournalNotes(prev => ({ ...prev, [entryId]: '' }));
  };

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
          <Accordion type="single" collapsible className="w-full">
            {MOCK_STORED_ENTRIES.map((entry) => (
              <AccordionItem value={entry.id} key={entry.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                                <p className="font-semibold capitalize">{entry.painInput.bodyParts.join(', ').replace('-', ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                      <p className="text-sm"><span className="font-medium">Top Suggestion:</span> {entry.analysisResult.diagnosticSuggestions[0].diagnosis} ({entry.analysisResult.diagnosticSuggestions[0].icd10Code})</p>
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
