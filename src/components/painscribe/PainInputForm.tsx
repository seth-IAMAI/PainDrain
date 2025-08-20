/// <reference types="dom-speech-recognition" />
"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { BodyDiagram, BodyPart } from '../painsribe/BodyDiagram';
import { Mic, StopCircle } from 'lucide-react';


interface PainInputFormProps {
  onSubmit: (data: PainFormData) => void;
}

export interface PainFormData {
  description: string;
  intensity: number;
  location: BodyPart[]; // Can be multiple locations from the body diagram
  type: string;
  onset: string;
  duration: string;
  aggravatingFactors: string;
  alleviatingFactors: string;
  radiating: boolean;
  radiationLocation?: string;
  pattern: string;
  associatedSymptoms: string;
  pastHistory: string;
  treatmentsTried: string;
  goals: string;
}


const PainInputForm: React.FC<PainInputFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PainFormData>({
    description: '',
    intensity: 5,
    location: [],
    type: '',
    onset: '',
    duration: '',
    aggravatingFactors: '',
    alleviatingFactors: '',
    radiating: false,
    radiationLocation: '',
    pattern: '',
    associatedSymptoms: '',
    pastHistory: '',
    treatmentsTried: '',
    goals: '',
  });

  const isMobile = useIsMobile();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSliderChange = (value: number[]) => {
    setFormData((prevData) => ({
      ...prevData,
      intensity: value[0],
    }));
  };

  const handleLocationChange = (selectedLocations: BodyPart[]) => {
    setFormData((prevData) => ({
      ...prevData,
      location: selectedLocations,
    }));
  };

  const handleSelectChange = (id: keyof PainFormData) => (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      radiating: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const startRecording = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error("Web Speech API is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prevData) => ({
        ...prevData,
        description: prevData.description + (prevData.description ? ' ' : '') + transcript,
      }));
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <div>
        <Label htmlFor="description" className="text-lg font-semibold">Pain Description</Label>
        <p className="text-sm text-gray-500 mb-2">Describe your pain. Our AI will translate it into medical terms.</p>
        <div className="flex items-center gap-2">
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., A sharp, shooting pain down my leg when I cough..."
            className="min-h-[100px]"
            ref={descriptionInputRef}
          />
           <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className="flex-shrink-0"
          >
            {isRecording ? <StopCircle className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="intensity" className="text-lg font-semibold">Pain Intensity</Label>
        <p className="text-sm text-gray-500 mb-4">Rate your pain on a scale of 0 to 10.</p>
        <Slider
          id="intensity"
          min={0}
          max={10}
          step={1}
          value={[formData.intensity]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2 text-gray-600">
          <span>0 (No Pain)</span>
          <span>10 (Worst Possible)</span>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold">Pain Location</Label>
        <p className="text-sm text-gray-500 mb-2">Click on the diagram to indicate where you feel pain.</p>
        <BodyDiagram onLocationClick={handleLocationChange} selectedLocations={formData.location} />
      </div>


      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-details">
          <AccordionTrigger className="text-lg font-semibold">Add More Details (Optional)</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div>
              <Label htmlFor="type" className="font-semibold">Type of Pain</Label>
              <Select onValueChange={handleSelectChange('type')} value={formData.type}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select pain type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aching">Aching</SelectItem>
                  <SelectItem value="burning">Burning</SelectItem>
                  <SelectItem value="stabbing">Stabbing</SelectItem>
                  <SelectItem value="sharp">Sharp</SelectItem>
                  <SelectItem value="dull">Dull</SelectItem>
                  <SelectItem value="throbbing">Throbbing</SelectItem>
                  <SelectItem value="shooting">Shooting</SelectItem>
                  <SelectItem value="อื่นๆ">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="onset" className="font-semibold">Onset</Label>
              <Input
                id="onset"
                value={formData.onset}
                onChange={handleInputChange}
                placeholder="e.g., Started suddenly after lifting"
              />
            </div>

            <div>
              <Label htmlFor="duration" className="font-semibold">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., Constant, Intermittent"
              />
            </div>

            <div>
              <Label htmlFor="aggravatingFactors" className="font-semibold">Aggravating Factors</Label>
              <Textarea
                id="aggravatingFactors"
                value={formData.aggravatingFactors}
                onChange={handleInputChange}
                placeholder="What makes your pain worse?"
              />
            </div>

            <div>
              <Label htmlFor="alleviatingFactors" className="font-semibold">Alleviating Factors</Label>
              <Textarea
                id="alleviatingFactors"
                value={formData.alleviatingFactors}
                onChange={handleInputChange}
                placeholder="What makes your pain better?"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="radiating"
                checked={formData.radiating}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="radiating" className="font-semibold">Is the pain radiating?</Label>
            </div>

            {formData.radiating && (
              <div>
                <Label htmlFor="radiationLocation" className="font-semibold">Radiation Location</Label>
                <Input
                  id="radiationLocation"
                  value={formData.radiationLocation || ''}
                  onChange={handleInputChange}
                  placeholder="Where does the pain radiate to?"
                />
              </div>
            )}

            <div>
              <Label htmlFor="pattern" className="font-semibold">Pattern</Label>
              <Input
                id="pattern"
                value={formData.pattern}
                onChange={handleInputChange}
                placeholder="e.g., Morning stiffness, worse at night"
              />
            </div>

            <div>
              <Label htmlFor="associatedSymptoms" className="font-semibold">Associated Symptoms</Label>
              <Textarea
                id="associatedSymptoms"
                value={formData.associatedSymptoms}
                onChange={handleInputChange}
                placeholder="Any other symptoms like numbness, tingling, weakness?"
              />
            </div>

            <div>
              <Label htmlFor="pastHistory" className="font-semibold">Past Medical History Relevant to Pain</Label>
              <Textarea
                id="pastHistory"
                value={formData.pastHistory}
                onChange={handleInputChange}
                placeholder="Previous injuries, surgeries, similar pain episodes"
              />
            </div>

            <div>
              <Label htmlFor="treatmentsTried" className="font-semibold">Treatments Tried</Label>
              <Textarea
                id="treatmentsTried"
                value={formData.treatmentsTried}
                onChange={handleInputChange}
                placeholder="Medications, therapies, home remedies you've tried"
              />
            </div>

            <div>
              <Label htmlFor="goals" className="font-semibold">Treatment Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={handleInputChange}
                placeholder="What do you hope to achieve with treatment?"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button type="submit" className="w-full">Submit Pain Details</Button>
    </form>
  );
};

export default PainInputForm;