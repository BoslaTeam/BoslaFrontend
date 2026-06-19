export const ROLES = {
  User: 'User',
  Specialist: 'Specialist',
  Admin: 'Admin',
} as const;

export type RoleKey = keyof typeof ROLES;