export const PERMISSIONS = {
  manageSpecialists: 'manage:specialists',
  manageUsers: 'manage:users',
  manageAppointments: 'manage:appointments',
  managePayments: 'manage:payments',
  viewAuditLogs: 'view:audit-logs',
  manageAiSettings: 'manage:ai-settings',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];