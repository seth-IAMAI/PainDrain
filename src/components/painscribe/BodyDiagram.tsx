'use client';
import React from 'react';
import { cn } from "@/lib/utils"

export type BodyPart = 
  | 'head' | 'chest' | 'abdomen' | 'pelvis' 
  | 'left-shoulder' | 'right-shoulder'
  | 'left-arm' | 'right-arm' 
  | 'left-leg' | 'right-leg'
  | 'left-hand' | 'right-hand'
  | 'left-foot' | 'right-foot';

interface BodyDiagramProps {
  selectedLocations: BodyPart[];
  onLocationClick: (locations: BodyPart[]) => void;
  gender: 'male' | 'female';
}

const femaleBodyParts: { id: BodyPart; path: string; }[] = [
    { id: 'head', path: 'M 100 20 C 115 20 125 30 125 45 C 125 60 115 70 100 70 C 85 70 75 60 75 45 C 75 30 85 20 100 20 Z' },
    { id: 'chest', path: 'M 75 80 L 125 80 L 120 120 L 80 120 Z' },
    { id: 'abdomen', path: 'M 80 120 L 120 120 L 115 150 L 85 150 Z' },
    { id: 'pelvis', path: 'M 85 150 L 115 150 L 110 170 L 90 170 Z' },
    { id: 'left-shoulder', path: 'M 75 80 L 65 85 L 70 95 L 80 90 Z'},
    { id: 'right-shoulder', path: 'M 125 80 L 135 85 L 130 95 L 120 90 Z'},
    { id: 'left-arm', path: 'M 65 85 L 55 140 L 65 140 L 75 95 Z' },
    { id: 'right-arm', path: 'M 135 85 L 145 140 L 135 140 L 125 95 Z' },
    { id: 'left-hand', path: 'M 55 140 L 45 150 L 55 155 L 60 145 Z'},
    { id: 'right-hand', path: 'M 145 140 L 155 150 L 145 155 L 140 145 Z'},
    { id: 'left-leg', path: 'M 90 170 L 80 230 L 95 230 L 98 170 Z' },
    { id: 'right-leg', path: 'M 110 170 L 120 230 L 105 230 L 102 170 Z' },
    { id: 'left-foot', path: 'M 80 230 L 70 235 L 80 240 L 90 232 Z' },
    { id: 'right-foot', path: 'M 120 230 L 130 235 L 120 240 L 110 232 Z' },
];

const maleBodyParts: { id: BodyPart; path: string; }[] = [
    { id: 'head', path: 'M 100 20 C 115 20 125 30 125 45 C 125 60 115 70 100 70 C 85 70 75 60 75 45 C 75 30 85 20 100 20 Z' },
    { id: 'chest', path: 'M 70 80 L 130 80 L 125 120 L 75 120 Z' },
    { id: 'abdomen', path: 'M 75 120 L 125 120 L 120 160 L 80 160 Z' },
    { id: 'pelvis', path: 'M 80 160 L 120 160 L 115 175 L 85 175 Z'},
    { id: 'left-shoulder', path: 'M 70 80 L 60 85 L 65 95 L 75 90 Z'},
    { id: 'right-shoulder', path: 'M 130 80 L 140 85 L 135 95 L 125 90 Z'},
    { id: 'right-arm', path: 'M 135 85 L 145 150 L 135 150 L 125 95 Z' },
    { id: 'left-arm', path: 'M 65 85 L 55 150 L 65 150 L 75 95 Z' },
    { id: 'left-hand', path: 'M 55 150 L 45 160 L 55 165 L 60 155 Z'},
    { id: 'right-hand', path: 'M 145 150 L 155 160 L 145 165 L 140 155 Z'},
    { id: 'right-leg', path: 'M 102 175 L 120 175 L 110 230 L 100 230 Z' },
    { id: 'left-leg', path: 'M 98 175 L 80 175 L 90 230 L 100 230 Z' },
    { id: 'left-foot', path: 'M 80 230 L 70 235 L 80 240 L 90 232 Z' },
    { id: 'right-foot', path: 'M 120 230 L 130 235 L 120 240 L 110 232 Z' },
];


export function BodyDiagram({ selectedLocations, onLocationClick, gender }: BodyDiagramProps) {
  const bodyPartsConfig = gender === 'male' ? maleBodyParts : femaleBodyParts;

  return (
    <div className="w-full flex justify-center p-4 bg-secondary/30 rounded-lg">
      <svg viewBox="0 0 200 250" className="max-w-[150px] w-full h-auto" data-ai-hint="body diagram">
        <g>
          {bodyPartsConfig.map((part) => (
            <path
              key={part.id}
              d={part.path}
              className={cn(
                "cursor-pointer transition-all fill-[hsl(var(--primary)/0.2)] stroke-primary stroke-2 hover:fill-[hsl(var(--primary)/0.4)]",
                selectedLocations.includes(part.id) && "fill-primary"
              )}
              onClick={() => {
                const newSelectedLocations = selectedLocations.includes(part.id)
                  ? selectedLocations.filter((location) => location !== part.id)
                  : [...selectedLocations, part.id];
                onLocationClick(newSelectedLocations);
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
