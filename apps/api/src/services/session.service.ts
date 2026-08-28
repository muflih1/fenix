import crypto from 'node:crypto';
import {db} from '../db/index.js';
import {sessionsTable, usersTable} from '../db/schema.js';
import type {CookieOptions} from 'express';
import {eq} from 'drizzle-orm';

const sessionExpiresIn = 60 * 60 * 24 * 30 * 1000;

let _sessionCookieName = 'sess';

export function getSessionCookieName() {
  return _sessionCookieName;
}

export function setSessionCookieName_DO_NOT_USE_THIS_IS_TRACKED(name: string) {
  _sessionCookieName = name;
}

export function getSetSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: false,
    path: '/',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    sameSite: 'lax',
  };
}

export async function createSession(userId: string) {
  const now = new Date();
  const id = crypto.randomUUID();
  const secret = crypto.randomBytes(32).toString('base64');
  const secretDigest = hashSecret(secret);

  const token = id + '.' + secret;

  const session = {
    id,
    userId,
    secretDigest,
    lastVerifiedAt: now,
    createdAt: now,
  };

  await db.insert(sessionsTable).values([session]);

  const sessionWithToken = {
    session,
    sessionToken: token,
  };

  return sessionWithToken;
}

export async function validateSessionToken(sessionToken: string) {
  const now = new Date();
  const tokenParts = sessionToken.split('.') as [string, string];
  if (tokenParts.length !== 2) {
    return null;
  }
  const sessionId = tokenParts[0];
  const encodedSessionSecret = tokenParts[1];
  const session = await getSession(sessionId);
  if (session === null) {
    return null;
  }
  if (now.getTime() - session.lastVerifiedAt.getTime() >= sessionExpiresIn) {
    return null;
  }
  const sessionSecretDigest = hashSecret(encodedSessionSecret);
  const secretValid = crypto.timingSafeEqual(
    sessionSecretDigest,
    session.secretDigest,
  );
  if (!secretValid) {
    return null;
  }
  if (now.getTime() - session.lastVerifiedAt.getTime() >= 60 * 60 * 1000) {
    session.lastVerifiedAt = now;
    await updateSession(sessionId, session);
  }
  return session;
}

export async function getSession(sessionId: string) {
  const [session] = await db
    .select({
      id: sessionsTable.id,
      userId: usersTable.id,
      role: usersTable.role,
      secretDigest: sessionsTable.secretDigest,
      lastVerifiedAt: sessionsTable.lastVerifiedAt,
      createdAt: sessionsTable.createdAt,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, sessionId));
  if (session == null) return null;
  return session;
}

export async function updateSession(
  sessionId: string,
  values: Partial<typeof sessionsTable.$inferInsert>,
) {
  const [session] = await db
    .update(sessionsTable)
    .set(values)
    .where(eq(sessionsTable.id, sessionId))
    .returning();
  if (session == null) {
    return null;
  }
  return session;
}

function hashSecret(secret: string) {
  return crypto.createHash('sha256').update(secret).digest();
}
