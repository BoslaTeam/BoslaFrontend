export interface SpecialistListItemDto {
  id: string;
  name: string;
  title?: string;
  profileImageUrl?: string;
  hourlyRate: number;
  experienceLevel: number; // Enum value
  verificationStatus: number; // Enum value
  rating: number;
  isOnline: boolean;
}

export interface GetSpecialistsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}
