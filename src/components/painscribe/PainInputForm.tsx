'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { BodyDiagram, BodyPart } from './BodyDiagram';
import { Mic, ArrowLeft, ArrowRight, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FIREBASE_CONFIG, REGION } from '@/lib/firebase';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;

    start(): void;
    stop(): void;
    abort(): void;

    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
  }


  interface SpeechRecognitionErrorCode {
    readonly ABORTED: number;
    readonly AUDIO_CAPTURE: number;
    readonly NETWORK: number;
    readonly NOT_ALLOWED: number;
    readonly NO_SPEECH: number;
    readonly SERVICE_NOT_ALLOWED: number;
    readonly BAD_GRAMMAR: number;
    readonly LANGUAGE_NOT_SUPPORTED: number;
    readonly NO_MATCH: number;
    readonly CANCELED: number; // Typo? should be ABORTED based on spec
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

const painTypes = ['Sharp', 'Dull', 'Aching', 'Throbbing', 'Burning', 'Stabbing', 'Shooting', 'Tingling'];

const formSchema = z.object({
  description: z.string().min(10, "Please describe your pain in at least 10 characters."),
  intensity: z.number().min(1).max(10),
  painTypes: z.array(z.string()).optional(),
  bodyParts: z.array(z.string()).min(1, "Please select at least one body part."),
});

type PainInputFormValues = z.infer<typeof formSchema>;

interface PainInputFormProps {
  setResult: (result: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
  isSubmitted?: boolean;
}

const totalSteps = 4;

function generatePrompt(values: PainInputFormValues): string {
  return `
      Analyze the following patient's pain description and provide a medical summary.
      The output should be a JSON object with the following structure:
      {
        "medicalTranslation": "A concise summary in clinical terms.",
        "diagnosticSuggestions": [
          { "diagnosis": "Name of condition", "icd10Code": "ICD-10", "confidence": percentage, "description": "Brief description." }
        ],
        "clinicalTerms": ["term1", "term2"],
        "recommendedQuestions": ["question1", "question2"],
        "urgencyLevel": "low" | "medium" | "high"
      }

      Patient's input:
      - Description: ${values.description}
      - Pain Intensity (1-10): ${values.intensity}
      - Pain Location: ${values.bodyParts.join(', ')}
      - Pain Types: ${values.painTypes?.join(', ') || 'Not specified'}
    `;
}

export function PainInputForm({ setResult, setIsLoading, setError, isLoading, setIsSubmitted, isSubmitted }: PainInputFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const micSupported = !!SpeechRecognition;
  const { toast } = useToast();

  const form = useForm<PainInputFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      description: '',
      intensity: 5,
      painTypes: [],
      bodyParts: [],
    },
  });

  const { control, setValue, getValues, trigger, formState: { errors } } = form;

  const getFunctionUrl = (functionName: string) => {
    const region = REGION;
    const projectId = FIREBASE_CONFIG.projectId;

    if (!projectId) {
      console.error("Firebase project ID is not set in environment variables.");
      return null;
    }
    return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
  };

  useEffect(() => {
    if (!SpeechRecognition) return;
    if (typeof window !== 'undefined' && SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const currentDescription = getValues('description');
        setValue('description', currentDescription + finalTranscript + interimTranscript, { shouldValidate: true, shouldDirty: true });
      };

      recognition.onerror = (event) => {
        toast({
          title: "Voice Recognition Error",
          description: `An error occurred with voice recognition: ${event.error}`,
          variant: "destructive",
        });
        setIsRecording(false);
      };

      recognition.onend = (event) => {
        if (isRecording) {
          setIsRecording(false);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [getValues, setValue, toast, isRecording, SpeechRecognition]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast({
          title: "Could not start recording",
          description: "Please ensure microphone permissions are granted.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBodyPartClick = (locations: BodyPart[]) => {
    setValue("bodyParts", locations, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (values: PainInputFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsSubmitted(true);

    const prompt = generatePrompt(values);

    try {
      const callAiUrl = getFunctionUrl('callAi');

      if (!callAiUrl) {
        toast({ title: 'Configuration Error', description: "Firebase project ID not configured.", variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const callAiResponse = await fetch(callAiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!callAiResponse.ok) {
        const errorData = await callAiResponse.text();
        throw new Error(`API returned ${callAiResponse.status}: ${errorData}`);
      }

      const data = await callAiResponse.json();

      // The AIMLAPI returns a stringified JSON in the 'content' of the first choice.
      const content = JSON.parse(data.choices[0].message.content);
      setResult(content);

    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get analysis. Please try again. Error: ${errorMsg}`);
      toast({
        title: "Analysis Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger("description");
    if (currentStep === 2) isValid = await trigger("bodyParts");
    if (currentStep === 3) isValid = true; // Slider defaults to 5
    if (currentStep === 4) isValid = true; // Optional field

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (isSubmitted && !isLoading) {
    return (
      <Card className="h-fit sticky top-8">
        <CardHeader>
          <CardTitle className="text-2xl">Pain Description</CardTitle>
          <CardDescription>Review your submission or start over.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Your Description</Label>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg">{getValues('description')}</p>
            </div>
            <div>
              <Label className="font-semibold">Affected Areas</Label>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg">{getValues('bodyParts').join(', ')}</p>
            </div>
            <div>
              <Label className="font-semibold">Pain Intensity</Label>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg">{getValues('intensity')}/10</p>
            </div>
            {getValues('painTypes') && getValues('painTypes')!.length > 0 && <div>
              <Label className="font-semibold">Pain Types</Label>
              <p className="text-sm p-3 bg-secondary/50 rounded-lg">{getValues('painTypes')?.join(', ')}</p>
            </div>}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => {
            form.reset();
            setIsSubmitted(false);
            setResult(null);
            setCurrentStep(1);
          }}>Start Over</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="h-fit sticky top-8">
      <CardHeader>
        <CardTitle className="text-2xl">Pain Description</CardTitle>
        <CardDescription>Describe your pain. Our AI will translate it into medical terms.</CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-2 animate-in fade-in">
              <Label htmlFor="description" className="font-semibold text-lg">What does your pain feel like?</Label>
              <div className="relative">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="e.g., A sharp, shooting pain down my leg when I cough..."
                      className="min-h-[120px] pr-10"
                      {...field}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleMicClick}
                  className={cn(
                    "absolute top-2 right-2 text-muted-foreground",
                    isRecording && "text-red-500 bg-red-500/10"
                  )}
                  disabled={!micSupported || !recognitionRef.current}
                >
                  {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3 animate-in fade-in">
               <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={selectedGender === 'female' ? 'secondary' : 'outline'}
                  onClick={() => setSelectedGender('female')}
                  className="w-full"
                >
                  Female
                </Button>
                <Button 
                  type="button" 
                  variant={selectedGender === 'male' ? 'secondary' : 'outline'}
                  onClick={() => setSelectedGender('male')}
                  className="w-full"
                >
                  Male
                </Button>
              </div>
              <Label className="font-semibold text-lg">Where do you feel the pain?</Label>
              <Controller
                name="bodyParts"
                control={control}
                render={({ field }) => (
                  <BodyDiagram 
                    gender={selectedGender}
                    selectedLocations={field.value as BodyPart[]} 
                    onLocationClick={handleBodyPartClick} />
                )}
              />
              {getValues('bodyParts').length > 0 && (
                    <p className="text-sm text-muted-foreground">Selected: {getValues('bodyParts').join(', ')}</p>
                  )}
              {errors.bodyParts && <p className="text-sm text-destructive">{errors.bodyParts.message}</p>}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              <Label htmlFor="intensity" className="font-semibold text-lg">How intense is the pain? (1-10)</Label>
              <Controller
                name="intensity"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-4 pt-4">
                    <Slider
                      id="intensity"
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <span className="font-bold text-2xl text-primary w-12 text-center">{field.value}</span>
                  </div>
                )}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3 animate-in fade-in">
              <Label className="font-semibold text-lg">Which words best describe your pain? (optional)</Label>
              <Controller
                name="painTypes"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {painTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2 p-2 rounded-lg bg-secondary/30">
                        <Checkbox
                          id={type}
                          checked={field.value?.includes(type)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), type])
                              : field.onChange(field.value?.filter(v => v !== type))
                          }}
                        />
                        <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <div />}

        {currentStep < totalSteps ? (
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Pain'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
