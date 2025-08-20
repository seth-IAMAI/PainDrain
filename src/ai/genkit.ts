import {genkit} from 'genkit';
import {openai} from 'openai';

export const ai = genkit({
  plugins: [openai()],
  model: 'openai/gpt-5',
});
