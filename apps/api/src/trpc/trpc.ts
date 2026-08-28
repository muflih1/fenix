import {initTRPC, TRPCError} from '@trpc/server';
import type {Context} from './index.js';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthenticated = t.middleware(({ctx, next}) => {
  if (ctx.session === null) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export function has() {
  return t.middleware(({ctx, next}) => {
    return next({ctx});
  });
}

export const protectedProcedure = t.procedure.use(isAuthenticated);
