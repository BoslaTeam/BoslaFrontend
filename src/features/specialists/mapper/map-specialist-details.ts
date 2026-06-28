import { SpecialistDetailsResponse } from '../contracts/specialist-details.contract';
import { SpecialistDetails } from '../models/specialist-details.model';
import { mapLookup } from './map-lookup';

export function mapSpecialistDetails(
    dto: SpecialistDetailsResponse,
): SpecialistDetails {
    return {
        id: dto.id,
        userId: dto.userId,
        email: dto.email,
        name: dto.name,
        title: dto.title ?? '',
        bio: dto.bio ?? '',
        imageUrl: dto.profileImageUrl ?? '',
        country: dto.country ?? '',
        gender: dto.gender ?? '',
        preferredLanguage: dto.preferredLanguage ?? '',
        experienceYears: dto.experienceYears,
        experienceLevel: dto.experienceLevel,
        hourlyRate: dto.hourlyRate,
        introVideoUrl: dto.introVideoUrl ?? '',
        isVerified: dto.verificationStatus === 1,
        tools: (dto.tools || []).map(t => typeof t === 'string' ? { id: t, name: t } : mapLookup(t as any)),
        skills: (dto.skills || []).map(s => typeof s === 'string' ? { id: s, name: s } : mapLookup(s as any)),
        industries: (dto.industries || []).map(i => typeof i === 'string' ? { id: i, name: i } : mapLookup(i as any)),
        rating: dto.rating,
        reviewsCount: dto.reviewsCount,
        isOnline: dto.isOnline,
    };
}
