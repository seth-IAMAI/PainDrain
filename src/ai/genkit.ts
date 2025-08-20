import {genkit} from 'genkit';
import {openai} from 'genkit-plugin-openai';

export const ai = genkit({
  plugins: [
    openai({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  ],
});
