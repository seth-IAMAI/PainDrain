'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { translatePainDescription } from '@/ai/flows/translate-pain-description';
import type { TranslatePainDescriptionOutput } from '@/ai/flows/translate-pain-description';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
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
  setResult: (result: TranslatePainDescriptionOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

export function PainInputForm({ setResult, setIsLoading, setError }: PainInputFormProps) {
  const { toast } = useToast();
  const [debouncedValues, setDebouncedValues] = useState<PainInputFormValues | null>(null);

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

  const { watch, control, setValue, getValues } = form;
  const watchedValues = watch();

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedValues(getValues());
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [watchedValues, getValues]);


  const handleTranslate = useCallback(async (values: PainInputFormValues) => {
    if (values.description.length < 10) return;
    
    setIsLoading(true);
    setError(null);

    const patientInput = `
      Description: ${values.description}.
      Pain Intensity: ${values.intensity}/10.
      Pain Types: ${values.painTypes.join(', ') || 'Not specified'}.
      Location: ${values.bodyParts.join(', ') || 'Not specified'}.
    `.trim();

    try {
      const result = await translatePainDescription({ patientInput });
      setResult(result);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(error);
      setResult(null);
      toast({
        title: "Translation Failed",
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setResult, setIsLoading, setError, toast]);

  useEffect(() => {
    if (debouncedValues) {
      handleTranslate(debouncedValues);
    }
  }, [debouncedValues, handleTranslate]);
  

  const handleBodyPartClick = (part: BodyPart) => {
    const currentParts = getValues("bodyParts");
    const newParts = currentParts.includes(part)
      ? currentParts.filter(p => p !== part)
      : [...currentParts, part];
    setValue("bodyParts", newParts, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card className="h-fit sticky top-8">
      <CardHeader>
        <CardTitle className="text-2xl">Pain Description</CardTitle>
        <CardDescription>Describe your pain. Our AI will translate it into medical terms as you type.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
        </div>
      </CardContent>
    </Card>
  );
}
