'use strict';

import {onRequest} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import axios from 'axios';

// It's recommended to store your API key as a secret for security.
// You can set it using the Firebase CLI:
// firebase functions:secrets:set AIMLAPI_KEY
const AIMLAPI_KEY = process.env.AIMLAPI_KEY;

export const callAi = onRequest(
  {secrets: ['AIMLAPI_KEY']},
  async (request, response) => {
    logger.info('Request received', {body: request.body});

    if (!AIMLAPI_KEY) {
      logger.error('AIMLAPI_KEY secret not set.');
      response.status(500).send('Server configuration error.');
      return;
    }

    if (!request.body.prompt) {
      response.status(400).send('Bad Request: "prompt" is required.');
      return;
    }

    try {
      const apiResponse = await axios.post(
        'https://api.aimlapi.com/v1/chat/completions',
        {
          model: 'gpt-4', // Or another model like 'gpt-5' when available
          messages: [{role: 'user', content: request.body.prompt}],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AIMLAPI_KEY}`,
          },
        }
      );

      logger.info('Successfully received response from AIML API.');
      response.status(200).json(apiResponse.data);
    } catch (error) {
      logger.error('Error calling AIML API:', error);
      if (axios.isAxiosError(error) && error.response) {
        response
          .status(error.response.status)
          .send(error.response.data);
      } else {
        response.status(500).send('Internal Server Error');
      }
    }
  }
);
