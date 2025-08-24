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

const totalSteps = 5;

function generatePrompt(values: PainInputFormValues): string {
  return `
      Analyze the following patient's pain description and provide a medical summary.
      Give no more than 3 Diagnostic Suggestions and no more than 4-5 Recommended Questions.
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [micSupported, setMicSupported] = useState(false);
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (typeof SpeechRecognition !== 'undefined') {
      setMicSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setValue('description', getValues('description') + finalTranscript + '. ', { shouldValidate: true, shouldDirty: true });
        }
      };
      
      recognition.onerror = (event) => {
        let errorMessage = `An error occurred with voice recognition: ${event.error}`;
        if (event.error === 'network') {
          errorMessage = 'Network error with voice recognition. Please check your internet connection and try again.';
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
        }
        
        toast({
          title: "Voice Recognition Error",
          description: errorMessage,
          variant: "destructive",
        });

        if (isRecording) setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
        setMicSupported(false);
    }
  }, [isRecording, getValues, setValue, toast]);

  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
         toast({
          title: "Could not start recording",
          description: "Please ensure microphone permissions are granted and try again.",
          variant: "destructive",
        });
      }
    }
  };


  const handleBodyPartClick = (locations: BodyPart[]) => {
    setValue("bodyParts", locations, { shouldValidate: true, shouldDirty: true });
  };
  
  const handleGenderSelect = (gender: 'female' | 'male') => {
    setSelectedGender(gender);
    setCurrentStep(prev => prev + 1);
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
    if (currentStep === 2) isValid = true; // Gender selection, no validation needed
    if (currentStep === 3) isValid = await trigger("bodyParts");
    if (currentStep === 4) isValid = true; // Slider defaults to 5
    if (currentStep === 5) isValid = true; // Optional field

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderCardHeader = () => {
    let title = "Pain Description";
    let description = "Describe your pain. Our AI will translate it into medical terms.";

    if (currentStep === 2) {
      title = "Gender";
      description = "Select the body type that best represents you."
    }
    
    if (currentStep === 3) {
      title = "Pain Mapping";
      description = "Select the area(s) where you feel pain.";
    }

    if(isSubmitted) {
      return (
        <CardHeader>
          <CardTitle className="text-2xl">Pain Description</CardTitle>
          <CardDescription>Review your submission or start over.</CardDescription>
        </CardHeader>
      )
    }

    return (
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
        </CardHeader>
    );
  };

  if (isSubmitted && !isLoading) {
    return (
      <Card className="h-fit sticky top-8">
        {renderCardHeader()}
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
      {renderCardHeader()}
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
                  disabled={!micSupported}
                  title={micSupported ? "Use voice" : "Voice not supported"}
                >
                  {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button" 
                    variant={selectedGender === 'female' ? 'secondary' : 'outline'}
                    onClick={() => handleGenderSelect('female')}
                    className="w-full h-12 text-lg"
                  >
                    Female
                  </Button>
                  <Button 
                    type="button" 
                    variant={selectedGender === 'male' ? 'secondary' : 'outline'}
                    onClick={() => handleGenderSelect('male')}
                     className="w-full h-12 text-lg"
                  >
                    Male
                  </Button>
                </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
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

          {currentStep === 4 && (
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

          {currentStep === 5 && (
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
          <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading || currentStep === 2}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <div />}

        {currentStep < totalSteps && currentStep !== 2 ? (
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          currentStep === totalSteps && (
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Pain'}
          </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
