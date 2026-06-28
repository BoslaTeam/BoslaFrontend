export interface ExperienceRequest {
  jobTitle: string;
  companyName: string;
  fromDate: string;
  toDate: string | null;
  description: string | null;
}

export interface AddExperiencesRequest {
  experiences: ExperienceRequest[];
}

export interface ExperienceResponse {
  id: string;
  companyName: string;
  jobTitle: string;
  description: string | null;
  fromDate: string;
  toDate: string | null;
}
