'use server';

/**
 * @fileOverview This flow summarizes potential conditions based on ICD-10 suggestions.
 *
 * - generateConditionSummary - A function that generates a summary of potential conditions.
 * - GenerateConditionSummaryInput - The input type for the generateConditionSummary function.
 * - GenerateConditionSummaryOutput - The return type for the generateConditionSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConditionSummaryInputSchema = z.object({
  icd10Code: z.string().describe('The ICD-10 code to summarize conditions for.'),
});
export type GenerateConditionSummaryInput = z.infer<typeof GenerateConditionSummaryInputSchema>;

const GenerateConditionSummaryOutputSchema = z.object({
  conditionSummary: z.string().describe('A summary of potential conditions related to the ICD-10 code.'),
});
export type GenerateConditionSummaryOutput = z.infer<typeof GenerateConditionSummaryOutputSchema>;

export async function generateConditionSummary(input: GenerateConditionSummaryInput): Promise<GenerateConditionSummaryOutput> {
  return generateConditionSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConditionSummaryPrompt',
  input: {schema: GenerateConditionSummaryInputSchema},
  output: {schema: GenerateConditionSummaryOutputSchema},
  prompt: `You are a medical expert. Please provide a concise summary of potential conditions related to the following ICD-10 code: {{{icd10Code}}}.`,
});

const generateConditionSummaryFlow = ai.defineFlow(
  {
    name: 'generateConditionSummaryFlow',
    inputSchema: GenerateConditionSummaryInputSchema,
    outputSchema: GenerateConditionSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
