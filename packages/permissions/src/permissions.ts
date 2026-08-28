export const PERMISSIONS = [
  'jobs:read',
  'jobs:create',
  'jobs:update',
  'jobs:delete',
  'jobs:approve',
  //
  'designs:read',
  'designs:upload',
  'designs:approve',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
