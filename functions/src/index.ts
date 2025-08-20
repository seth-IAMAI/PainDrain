'use strict';

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import OpenAI from 'openai';

// It's recommended to store your API key as a secret for security.
// You can set it using the Firebase CLI:
// firebase functions:secrets:set AIMLAPI_KEY
const AIMLAPI_KEY = process.env.AIMLAPI_KEY;

const openai = new OpenAI({
  apiKey: AIMLAPI_KEY,
  baseURL: 'https://api.aimlapi.com/v1',
});

export const callAi = onRequest({ cors: true, secrets: ['AIMLAPI_KEY'] },
  async (request, response) => {
    logger.info('Request received', { body: request.body });

    if (!AIMLAPI_KEY) {
      logger.error('AIMLAPI_KEY secret not set.');
      response.status(500).send('Server configuration error.');

      if (!request.body.prompt) {
        response.status(400).send('Bad Request: "prompt" is required.');
        return;
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'openai/gpt-5-mini-2025-08-07', // Or another model like 'gpt-5' when available
          messages: [{ role: 'user', content: request.body.prompt }],
        });

        logger.info('Successfully received response from AIML API.');
        response.status(200).json(completion.choices[0].message);
      } catch (error) {
        logger.error('Error calling AIML API:', error);
        if (error instanceof OpenAI.APIError && error.status) {
          response.status(error.status).send(error.message);
        } else {
          response.status(500).send('Internal Server Error');
        }
      }
    }
  });
