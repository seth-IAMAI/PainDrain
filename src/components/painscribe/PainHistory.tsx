
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Activity, Calendar as CalendarIcon, Info, BookUser, Plus, Frown } from 'lucide-react';
import { StoredPainEntry, JournalLog } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PainHistoryProps {
    entries: StoredPainEntry[];
    setEntries: (entries: StoredPainEntry[] | ((prev: StoredPainEntry[]) => StoredPainEntry[])) => void;
}

interface JournalState {
    notes: string;
    intensity: number;
    activity: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 bg-background border rounded-lg shadow-lg">
                <p className="font-bold text-sm">{new Date(data.timestamp).toLocaleDateString()}</p>
                <p className="text-primary">Intensity: {data.intensity}</p>
                {data.notes && <p className="text-xs mt-1">Notes: {data.notes}</p>}
                {data.activity && <p className="text-xs">Activity: {data.activity}</p>}
            </div>
        );
    }
    return null;
};


export function PainHistory({ entries, setEntries }: PainHistoryProps) {
  const [journalState, setJournalState] = useState<Record<string, JournalState>>({});

  const handleStateChange = (entryId: string, field: keyof JournalState, value: string | number) => {
    setJournalState(prev => ({ 
        ...prev, 
        [entryId]: {
            ...prev[entryId],
            notes: prev[entryId]?.notes ?? '',
            activity: prev[entryId]?.activity ?? '',
            intensity: prev[entryId]?.intensity ?? 5,
            [field]: value
        } 
    }));
  };

  const handleAddLog = (entryId: string) => {
    const currentState = journalState[entryId];
    if (!currentState || !currentState.notes) return;

    const newLog: JournalLog = {
      id: `log_${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      notes: currentState.notes,
      intensity: currentState.intensity,
      activity: currentState.activity,
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

    setJournalState(prev => ({ ...prev, [entryId]: { notes: '', intensity: 5, activity: '' } }));
  };

  const getChartData = (entry: StoredPainEntry) => {
    const initialPoint = {
        timestamp: entry.timestamp,
        intensity: entry.painInput.intensity,
        notes: "Initial Entry: " + entry.painInput.description,
        activity: "N/A"
    };

    const journalPoints = entry.journalLogs
        .filter(log => log.intensity !== undefined)
        .map(log => ({
            timestamp: log.timestamp,
            intensity: log.intensity!,
            notes: log.notes,
            activity: log.activity
        }));
    
    return [initialPoint, ...journalPoints].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
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
            {entries.map((entry) => {
                const chartData = getChartData(entry);
                const currentJournalEntry = journalState[entry.id] || { notes: '', intensity: 5, activity: '' };
                return (
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
                  {/* Condition Trend Chart */}
                  <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
                      <h4 className="font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Pain Intensity Trend</h4>
                      <p className="text-sm text-muted-foreground italic">"{entry.painInput.description}"</p>
                      <Separator />
                      <div className="h-[250px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="timestamp" 
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                    tick={{ fontSize: 12 }} 
                                />
                                <YAxis domain={[0, 10]} unit="/10" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="intensity" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
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
                                    {log.intensity && <Badge variant="outline" className="ml-2">Intensity: {log.intensity}</Badge>}
                                    <p>{log.notes}</p>
                                    {log.activity && <p className="text-xs text-muted-foreground">Activity: {log.activity}</p>}
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-sm text-muted-foreground pl-7">No journal entries yet. Add one below!</p>
                     )}

                    <div className="pt-4 space-y-4">
                        <div>
                            <Label htmlFor={`notes-${entry.id}`} className="font-medium">New Log / Notes</Label>
                            <Textarea 
                                id={`notes-${entry.id}`}
                                placeholder="How are you feeling now? Any new triggers or relief?" 
                                value={currentJournalEntry.notes}
                                onChange={(e) => handleStateChange(entry.id, 'notes', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <Label htmlFor={`activity-${entry.id}`} className="font-medium">Activity / Trigger</Label>
                             <Input
                                id={`activity-${entry.id}`}
                                placeholder="e.g., Sitting for 2 hours"
                                value={currentJournalEntry.activity}
                                onChange={(e) => handleStateChange(entry.id, 'activity', e.target.value)}
                             />
                           </div>
                           <div>
                                <Label htmlFor={`intensity-${entry.id}`} className="font-medium">Current Intensity</Label>
                                 <div className="flex items-center gap-2 pt-2">
                                     <Slider
                                         id={`intensity-${entry.id}`}
                                         min={1} max={10} step={1}
                                         value={[currentJournalEntry.intensity]}
                                         onValueChange={(val) => handleStateChange(entry.id, 'intensity', val[0])}
                                     />
                                    <span className="font-bold text-lg text-primary w-10 text-center">{currentJournalEntry.intensity}</span>
                                 </div>
                           </div>
                        </div>
                        <Button size="sm" onClick={() => handleAddLog(entry.id)} disabled={!currentJournalEntry.notes}>
                            <Plus className="mr-2 h-4 w-4" /> Add Log
                        </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
