'use server';

/**
 * @fileOverview Translates patient pain descriptions into medical terminology and suggests potential diagnoses.
 *
 * - translatePainDescription - A function that translates pain descriptions.
 * - TranslatePainDescriptionInput - The input type for the translatePainDescription function.
 * - TranslatePainDescriptionOutput - The return type for the translatePainDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslatePainDescriptionInputSchema = z.object({
  patientInput: z.string().describe('The patient\'s description of their pain.'),
});
export type TranslatePainDescriptionInput = z.infer<typeof TranslatePainDescriptionInputSchema>;

const DiagnosticSuggestionSchema = z.object({
  diagnosis: z.string().describe('Possible diagnosis based on the pain description.'),
  icd10Code: z.string().describe('ICD-10 code for the diagnosis.'),
  confidence: z.number().describe('Confidence score (0-100) for the diagnosis suggestion.'),
  description: z.string().describe('A description of the diagnosis suggestion'),
});

const TranslatePainDescriptionOutputSchema = z.object({
  patientInput: z.string().describe('The original patient input.'),
  medicalTranslation: z.string().describe('Translation of the pain description into medical terminology.'),
  diagnosticSuggestions: z.array(DiagnosticSuggestionSchema).describe('Array of possible diagnostic suggestions.'),
  clinicalTerms: z.array(z.string()).describe('Array of extracted clinical terms.'),
  recommendedQuestions: z.array(z.string()).describe('Array of recommended follow-up questions.'),
  urgencyLevel: z.enum(['low', 'medium', 'high']).describe('The urgency level based on the pain description.'),
});
export type TranslatePainDescriptionOutput = z.infer<typeof TranslatePainDescriptionOutputSchema>;

export async function translatePainDescription(
  input: TranslatePainDescriptionInput
): Promise<TranslatePainDescriptionOutput> {
  return translatePainDescriptionFlow(input);
}

const translatePainDescriptionPrompt = ai.definePrompt({
  name: 'translatePainDescriptionPrompt',
  input: {schema: TranslatePainDescriptionInputSchema},
  output: {schema: TranslatePainDescriptionOutputSchema},
  prompt: `You are a medical translation AI that converts patient pain descriptions into precise medical terminology.

Instructions:
1. Analyze the patient\'s natural language pain description
2. Identify key clinical indicators (location, quality, timing, aggravating factors)
3. Translate to appropriate medical terminology
4. Suggest possible diagnostic categories with ICD-10 codes
5. Provide confidence score based on description specificity
6. Identify clinical terms from the description
7. Suggest possible follow-up questions to better understand the patient's pain
8. Determine the urgency level based on the pain description.
9. Format output in structured JSON for frontend consumption

Here is the patient's description:
{{patientInput}}`,
});

const translatePainDescriptionFlow = ai.defineFlow(
  {
    name: 'translatePainDescriptionFlow',
    inputSchema: TranslatePainDescriptionInputSchema,
    outputSchema: TranslatePainDescriptionOutputSchema,
  },
  async input => {
    const {output} = await translatePainDescriptionPrompt(input);
    return output!;
  }
);
