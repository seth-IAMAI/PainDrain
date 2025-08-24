'use strict';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

import { OpenAI } from 'openai';
const OPENAI_MODEL = 'openai/gpt-5-2025-08-07';

const AIML_API_KEY = defineSecret("AIML_API_KEY");
const AIML_API_URL = 'https://api.aimlapi.com/v1';
const SYSTEM_PROMPT = 'You are an expert and highly updated AI assistant who knows everything about latest factual, medically-proven information.';
const modelOptions = {
  model: OPENAI_MODEL,
  max_completion_tokens: 10000,
};

export const callAi = onRequest({ cors: ['*'], secrets: [AIML_API_KEY] },
  async (request, response) => {
    logger.info('Request received', { body: request.body });
    if (!AIML_API_KEY) {
      logger.error('AIML_API_KEY secret not set.');
      response.status(500).send('Server configuration error.');
      return;
    }

    const prompt = request.body.prompt;

    if (!prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    try {
      const api = new OpenAI({
        baseURL: AIML_API_URL,
        apiKey: AIML_API_KEY.value(),
      });

      const result = await api.chat.completions.create({
        ...modelOptions,
        reasoning_effort: 'low',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const message = result.choices[0].message.content;
      logger.info(`Assistant: ${message}`);
      logger.info(`typeof: ${typeof message}`);
      response.status(200).json(result);
      return;
    } catch (error) {
      logger.error('Error calling AIML API:', error);
      response.status(500).send('Error communicating with the AI model.');
      return;
    }
  });

export const testAi = onRequest({ cors: true },
  async (request, response) => {
    logger.info('Test Request received', { body: request.body });
    const prompt = request.body.prompt;

    if (!prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    const api = new OpenAI({
      baseURL: AIML_API_URL,
      apiKey: request.body.api_key,
    });

    const result = await api.chat.completions.create({
      ...modelOptions,
      reasoning_effort: 'low',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
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
    return;
  });
