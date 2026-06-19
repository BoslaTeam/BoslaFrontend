export const APP_CONFIG = {
  appName: 'Bosla',
  defaultPageSize: 10,
  maxPageSize: 50,
  searchDebounceMs: 400,
  toastDurationMs: 4000,
  maxFileUploadSizeMb: 10,
  supportedFileTypes: ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'],
  reminderMinutesBeforeSession: 15,
} as const;