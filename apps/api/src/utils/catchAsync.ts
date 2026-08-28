import type {NextFunction, Request, RequestHandler, Response} from 'express';

export function catchAsync<T>(
  maybeAsyncFn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<T> | void,
): RequestHandler {
  return function handler(req, res, next) {
    Promise.resolve(maybeAsyncFn(req, res, next)).catch(next);
  };
}
