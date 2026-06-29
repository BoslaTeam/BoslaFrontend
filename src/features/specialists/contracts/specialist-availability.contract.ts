export interface AvailabilityRequest {
  start: string;
  end: string;
}

export interface AddAvailabilitiesRequest {
  availabilities: AvailabilityRequest[];
}

export interface SpecialistAvailabilityResponse {
    id: string;
    start: string;
    end: string;
}