import { environment } from "@environments/environment";

export const API_CONFIG = {
  baseUrl: environment.apiBaseUrl,
  timeout: 30000,
  apiVersion: 'v1',
} as const;