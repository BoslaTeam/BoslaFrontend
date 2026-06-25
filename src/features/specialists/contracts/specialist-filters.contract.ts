export interface SpecialistsFilters {
    pageNumber: number;
    pageSize: number;

    searchTerm?: string;

    experienceLevel?: number;

    minHourlyRate?: number;

    maxHourlyRate?: number;

    skillId?: string;

    toolId?: string;

    expertiseId?: string;
}