import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export function comparePassword(password: string, digest: string) {
  return bcrypt.compare(password, digest);
}
