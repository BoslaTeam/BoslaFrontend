export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
  country: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface EducationDto {
  id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface AddEducationRequest {
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface UpdateEducationRequest {
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface SocialLinkDto {
  id: string;
  platform: string;
  url: string;
}

export interface AddSocialLinkRequest {
  platform: string;
  url: string;
}

