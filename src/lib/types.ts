
import type { BodyPart as AppBodyPart } from '@/components/painscribe/BodyDiagram';

export type BodyPart = AppBodyPart;

export interface PainEntry {
  date: string;
  intensity: number;
  bodyPart: BodyPart | string;
  types: string[];
  trigger?: string;
}
