export enum SpecialistDocumentType {
  Identity = 1,
  Certificate = 2,
}

export interface SpecialistDocumentResponse {
  id: string;
  type: SpecialistDocumentType;
  url: string;
  originalFileName: string;
}
