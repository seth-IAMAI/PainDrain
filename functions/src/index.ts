'use strict';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

import { OpenAI } from 'openai';

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
      const apiResponse: Response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
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
      const data = await apiResponse.json();
      logger.info('Successfully received response from AIML API.',data);
      response.status(apiResponse.status).json(data);
    } catch (error) {
      logger.error('Error calling AIML API:', error);
      response.status(500).send('Error communicating with the AI model.');
    }
  });

export const testAi = onRequest({ cors: true, secrets: [AIMLAPI_KEY] },
  async (request, response) => {
    logger.info('Test Request received', { body: request.body });
    if (!AIMLAPI_KEY) {
      logger.error('AIMLAPI_KEY secret not set.');
      response.status(500).send('Server configuration error.');
      return;
    }

    const prompt = request.body.prompt;

    if (!prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    const api = new OpenAI({
      baseURL: 'https://api.aimlapi.com/v1',
      apiKey: AIMLAPI_KEY.value(),
    });
    
      const result = await api.chat.completions.create({
        model: 'openai/gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant who knows everything.',
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });
    
      const message = result.choices[0].message.content;
      logger.info(`Assistant: ${message}`);
      response.status(200).json(result);
  });

