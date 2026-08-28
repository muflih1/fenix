import {SessionService} from '../../services/index.js';
import {catchAsync} from '../../utils/catchAsync.js';
import omit from 'lodash.omit';

export function session() {
  return catchAsync(async (req, res, next) => {
    const sessionToken = req.cookies[SessionService.getSessionCookieName()];
    if (sessionToken != null) {
      const session = await SessionService.validateSessionToken(sessionToken);
      if (session !== null) {
        req.session = omit(session, ['secretDigest']);
      }
    }
    next();
  });
}

declare global {
  namespace Express {
    interface Request {
      session: Omit<
        NonNullable<
          Awaited<ReturnType<typeof SessionService.validateSessionToken>>
        >,
        'secretDigest'
      >;
    }
  }
}
