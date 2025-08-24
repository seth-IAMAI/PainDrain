
import type { BodyPart as AppBodyPart } from '@/components/painscribe/BodyDiagram';

export type BodyPart = AppBodyPart;

// The structure of the data submitted from the input form
export interface PainInputData {
  description: string;
  intensity: number;
  painTypes: string[];
  bodyParts: string[];
}

// A single log entry in a user's journal for a specific pain instance
export interface JournalLog {
  id: string;
  timestamp: string;
  notes: string;
  photo?: string; 
  activity?: string; 
}

// The comprehensive data structure for a single, stored pain entry
export interface StoredPainEntry {
  id: string; // Unique ID for the entire entry
  timestamp: string; // ISO date string for when the entry was created
  painInput: PainInputData;
  analysisResult: any; // The raw JSON output from the AI analysis
  journalLogs: JournalLog[];
  userInput?: PainInputData; // Keep the original input
}


// This type was used for the old static mock data. Keeping for reference but new components should use StoredPainEntry.
export interface PainEntry {
  date: string;
  intensity: number;
  bodyPart: BodyPart | string;
  types: string[];
  trigger?: string;
}
