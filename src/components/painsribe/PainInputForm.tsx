'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { BodyDiagram, BodyPart } from './BodyDiagram';
import { Mic } from 'lucide-react';

const painTypes = ['Sharp', 'Dull', 'Aching', 'Throbbing', 'Burning', 'Stabbing', 'Shooting', 'Tingling'];

const formSchema = z.object({
  description: z.string().min(10, "Please describe your pain in at least 10 characters."),
  intensity: z.number().min(1).max(10),
  painTypes: z.array(z.string()),
  bodyParts: z.array(z.string()),
});

type PainInputFormValues = z.infer<typeof formSchema>;

interface PainInputFormProps {
  setResult: (result: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export function PainInputForm({ setResult, setIsLoading, setError, isLoading }: PainInputFormProps) {

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

  const { control, setValue, getValues } = form;

  const handleBodyPartClick = (part: BodyPart) => {
    const currentParts = getValues("bodyParts");
    const newParts = currentParts.includes(part)
      ? currentParts.filter(p => p !== part)
      : [...currentParts, part];
    setValue("bodyParts", newParts, { shouldValidate: true, shouldDirty: true });
  };
  
  const onSubmit = (values: PainInputFormValues) => {
    // This is where the AI call would happen.
    // Since Genkit is removed, we'll just log the data for now.
    console.log(values);
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        setResult({
            patientInput: JSON.stringify(values, null, 2),
            medicalTranslation: "AI functionality has been removed. This is placeholder data.",
            diagnosticSuggestions: [],
            clinicalTerms: [],
            recommendedQuestions: [],
            urgencyLevel: 'low',
        });
    }, 1000)
  }

  return (
    <Card className="h-fit sticky top-8">
      <CardHeader>
        <CardTitle className="text-2xl">Pain Description</CardTitle>
        <CardDescription>Describe your pain. Our AI will translate it into medical terms.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">What does your pain feel like?</Label>
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
              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground" disabled>
                <Mic className="h-5 w-5" />
              </Button>
            </div>
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Where do you feel the pain?</Label>
            <Controller
              name="bodyParts"
              control={control}
              render={({ field }) => (
                <BodyDiagram selectedParts={field.value as BodyPart[]} onPartClick={handleBodyPartClick} />
              )}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="intensity" className="font-semibold">Pain Intensity (1-10)</Label>
            <Controller
              name="intensity"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-4">
                  <Slider
                    id="intensity"
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <span className="font-bold text-lg text-primary w-8 text-center">{field.value}</span>
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Pain Type (optional)</Label>
            <Controller
              name="painTypes"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {painTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={field.value?.includes(type)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, type])
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Pain'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
