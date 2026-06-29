export interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expiresAt: string;
}

export interface VideoSessionDto {
  id: string;
  appointmentId: string;
  channelName: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  participants: VideoSessionParticipant[];
}

export interface VideoSessionParticipant {
  userId: string;
  userName: string;
  role: string;
  joinedAt?: string | null;
  leftAt?: string | null;
}

export interface StartSessionResponse {
  videoSessionId: string;
  startedAt: string;
}

export interface EndSessionResponse {
  videoSessionId: string;
  endedAt: string;
}
