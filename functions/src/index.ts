'use strict';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

const AIMLAPI_KEY = defineSecret("AIMLAPI_KEY");

export const callAi = onRequest({ cors: true, secrets: [AIMLAPI_KEY] },
  async (request, response) => {
    logger.info('Request received', { body: request.body });
    if (!AIMLAPI_KEY) {
      logger.error('AIMLAPI_KEY secret not set.');
      response.status(500).send('Server configuration error.');
      return;
    }

    const prompt = request.body.prompt;

    if (!request.body.prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    try {
      const apiResponse: Response = await fetch("https://api.aimlapi.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AIMLAPI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 512,
          stream: false,
        }),
      });
      logger.info('Successfully received response from AIML API.');
      const data = await apiResponse.json();
      response.status(apiResponse.status).json(data);
    } catch (error) {
      logger.error('Error calling AIML API:', error);
      response.status(500).send('Error communicating with the AI model.');
    }
  });

