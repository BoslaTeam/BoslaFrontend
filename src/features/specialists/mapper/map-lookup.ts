import { LookupResponse } from '../contracts/lookup.contract';
import { LookupItem } from '../models/lookup.model';

export function mapLookup(
    dto: LookupResponse,
): LookupItem {
    return {
        id: dto.id,
        name: dto.name,
    };
}