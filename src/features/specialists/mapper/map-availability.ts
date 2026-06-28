import { SpecialistAvailabilityResponse } from '../contracts/specialist-availability.contract';
import { Availability } from '../models/availability.model';

export function mapAvailability(
    dto: SpecialistAvailabilityResponse,
): Availability {
    return {
        id: dto.id,

        start: new Date(dto.start),

        end: new Date(dto.end),
    };
}