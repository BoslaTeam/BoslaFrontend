import { SpecialistResponse } from '../contracts/specialist.contract';
import { Specialist } from '../models/specialist.model';

export function mapSpecialist(
    dto: SpecialistResponse,
): Specialist {
    return {
        id: dto.id,

        name: dto.name,

        title: dto.title ?? '',

        imageUrl: dto.profileImageUrl ?? '',

        hourlyRate: dto.hourlyRate,

        experienceLevel: dto.experienceLevel,

        rating: dto.rating,

        isOnline: dto.isOnline,

        isVerified: dto.verificationStatus === 1,
    };
}