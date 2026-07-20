export interface FavoriteSpecialistDto {
  id: string;
  specialistId: string;
  name: string;
  title: string;
  imageUrl: string | null;
  rating: number;
  isVerified: boolean;
  experienceLevel: number;
  hourlyRate: number;
  createdAtUtc: string;
}
