import type {CreateExpressContextOptions} from '@trpc/server/adapters/express';
import {SessionService} from '../services/index.js';
import omit from 'lodash.omit';

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  const sessionToken = req.cookies[SessionService.getSessionCookieName()];
  const session =
    sessionToken != null
      ? await SessionService.validateSessionToken(sessionToken)
      : null;
  return {
    session: omit(session, ['secretDigest']),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
