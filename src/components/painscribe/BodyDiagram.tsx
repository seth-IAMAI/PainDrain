'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils"

export type BodyPart = 
  | 'head' | 'chest' | 'abdomen' | 'pelvis' 
  | 'left-shoulder' | 'right-shoulder'
  | 'left-arm' | 'right-arm' 
  | 'left-leg' | 'right-leg'
  | 'left-hand' | 'right-hand'
  | 'left-foot' | 'right-foot'
  | 'upper-back' | 'lower-back';

interface BodyDiagramProps {
  selectedLocations: BodyPart[];
  onLocationClick: (locations: BodyPart[]) => void;
  gender: 'male' | 'female';
}

const bodyPartHotspots: { id: BodyPart; x: number; y: number; width: number; height: number; view: 'front' | 'back' }[] = [
    // Front view (viewer's perspective)
    { id: 'head', x: 40, y: 2, width: 20, height: 13, view: 'front' },
    { id: 'chest', x: 33, y: 16, width: 34, height: 12, view: 'front' },
    { id: 'abdomen', x: 35, y: 28, width: 30, height: 10, view: 'front' },
    { id: 'pelvis', x: 35, y: 38, width: 30, height: 8, view: 'front' },
    { id: 'right-shoulder', x: 25, y: 16, width: 10, height: 5, view: 'front' }, // Patient's Right
    { id: 'left-shoulder', x: 65, y: 16, width: 10, height: 5, view: 'front' }, // Patient's Left
    { id: 'right-arm', x: 18, y: 22, width: 15, height: 35, view: 'front' }, // Patient's Right
    { id: 'left-arm', x: 67, y: 22, width: 15, height: 35, view: 'front' }, // Patient's Left
    { id: 'right-hand', x: 15, y: 57, width: 10, height: 10, view: 'front' }, // Patient's Right
    { id: 'left-hand', x: 75, y: 57, width: 10, height: 10, view: 'front' }, // Patient's Left
    { id: 'right-leg', x: 35, y: 46, width: 15, height: 40, view: 'front' }, // Patient's Right
    { id: 'left-leg', x: 50, y: 46, width: 15, height: 40, view: 'front' }, // Patient's Left
    { id: 'right-foot', x: 35, y: 86, width: 15, height: 8, view: 'front' }, // Patient's Right
    { id: 'left-foot', x: 50, y: 86, width: 15, height: 8, view: 'front' }, // Patient's Left
    
    // Back view (viewer's perspective)
    { id: 'head', x: 40, y: 2, width: 20, height: 13, view: 'back' },
    { id: 'upper-back', x: 33, y: 16, width: 34, height: 12, view: 'back' },
    { id: 'lower-back', x: 35, y: 28, width: 30, height: 10, view: 'back' },
    { id: 'left-arm', x: 18, y: 22, width: 15, height: 35, view: 'back' },
    { id: 'right-arm', x: 67, y: 22, width: 15, height: 35, view: 'back' },
    { id: 'left-hand', x: 15, y: 57, width: 10, height: 10, view: 'back' },
    { id: 'right-hand', x: 75, y: 57, width: 10, height: 10, view: 'back' },
    { id: 'left-leg', x: 35, y: 46, width: 15, height: 40, view: 'back' },
    { id: 'right-leg', x: 50, y: 46, width: 15, height: 40, view: 'back' },
    { id: 'left-foot', x: 35, y: 86, width: 15, height: 8, view: 'back' },
    { id: 'right-foot', x: 50, y: 86, width: 15, height: 8, view: 'back' },
];


export function BodyDiagram({ selectedLocations, onLocationClick, gender }: BodyDiagramProps) {
    const frontImage = gender === 'male' ? '/male-front.webp' : '/female-front.webp';
    const backImage = gender === 'male' ? '/male-back.webp' : '/female-back.webp';
    
    const toggleLocation = (partId: BodyPart) => {
        const newSelectedLocations = selectedLocations.includes(partId)
          ? selectedLocations.filter((location) => location !== partId)
          : [...selectedLocations, partId];
        onLocationClick(newSelectedLocations);
    };

  return (
    <div className="w-full grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg">
      <div className="relative" data-ai-hint="body diagram female front">
        <Image src={frontImage} alt={`${gender} front view`} width={200} height={400} className="w-full h-auto" />
        <div className="absolute inset-0">
          {bodyPartHotspots.filter(p => p.view === 'front').map((part) => (
            <div
              key={`${part.id}-front`}
              className={cn(
                "absolute cursor-pointer rounded-md transition-all bg-primary/20 hover:bg-primary/40",
                selectedLocations.includes(part.id) && "bg-primary/80"
              )}
              style={{
                left: `${part.x}%`,
                top: `${part.y}%`,
                width: `${part.width}%`,
                height: `${part.height}%`,
              }}
              onClick={() => toggleLocation(part.id)}
              title={part.id.replace('-', ' ')}
            />
          ))}
        </div>
      </div>
      <div className="relative" data-ai-hint="body diagram female back">
        <Image src={backImage} alt={`${gender} back view`} width={200} height={400} className="w-full h-auto" />
        <div className="absolute inset-0">
          {bodyPartHotspots.filter(p => p.view === 'back').map((part) => (
            <div
              key={`${part.id}-back`}
              className={cn(
                "absolute cursor-pointer rounded-md transition-all bg-primary/20 hover:bg-primary/40",
                selectedLocations.includes(part.id) && "bg-primary/80"
              )}
              style={{
                left: `${part.x}%`,
                top: `${part.y}%`,
                width: `${part.width}%`,
                height: `${part.height}%`,
              }}
              onClick={() => toggleLocation(part.id)}
              title={part.id.replace('-', ' ')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
