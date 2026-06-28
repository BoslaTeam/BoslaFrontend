export interface SpecialistSearchRequest {
  pageNumber: number;
  pageSize: number;

  searchTerm?: string;

  expertiseId?: string;
  skillId?: string;
  toolId?: string;

  minHourlyRate?: number;
  maxHourlyRate?: number;

  experienceLevel?: number;
}