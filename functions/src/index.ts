'use strict';

import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import OpenAI from 'openai';

// It's recommended to store your API key as a secret for security.

export const callAi = onRequest({ cors: true, secrets: ['OPENAI_API_KEY'] },
  async (request, response) => {
    logger.info('Request received', { body: request.body });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY secret not set.');
      response.status(500).send('Server configuration error.');
      return;
    }

    if (!request.body.prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
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
  });

