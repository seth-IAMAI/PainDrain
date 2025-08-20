'use client';
import React from 'react';
import { cn } from "@/lib/utils"

export type BodyPart = 'head' | 'chest' | 'abdomen' | 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg';

interface BodyDiagramProps {
  selectedParts: BodyPart[];
  onPartClick: (part: BodyPart) => void;
}

export function BodyDiagram({ selectedParts, onPartClick }: BodyDiagramProps) {
  const bodyPartsConfig: { id: BodyPart; path: string; }[] = [
    { id: 'head', path: 'M 100 20 C 115 20 125 30 125 45 C 125 60 115 70 100 70 C 85 70 75 60 75 45 C 75 30 85 20 100 20 Z' },
    { id: 'chest', path: 'M 70 80 L 130 80 L 125 120 L 75 120 Z' },
    { id: 'abdomen', path: 'M 75 120 L 125 120 L 120 160 L 80 160 Z' },
    { id: 'right-arm', path: 'M 130 85 L 140 85 L 150 150 L 140 150 Z' },
    { id: 'left-arm', path: 'M 70 85 L 60 85 L 50 150 L 60 150 Z' },
    { id: 'right-leg', path: 'M 102 160 L 120 160 L 110 230 L 100 230 Z' },
    { id: 'left-leg', path: 'M 98 160 L 80 160 L 90 230 L 100 230 Z' },
  ];

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
                selectedParts.includes(part.id) && "fill-primary"
              )}
              onClick={() => onPartClick(part.id)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
