export interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expiresAt: string;
  sessionId: string;
}

export interface RecordingInfoDto {
  status: string | null;
  startedAtUtc: string | null;
  completedAtUtc: string | null;
  isRecording: boolean;
  canStartRecording: boolean;
  canStopRecording: boolean;
  currentRecordingId: string | null;
  url: string | null;
}

export interface StartRecordingResponse {
  sessionId: string;
  recordingId: string;
  startedAtUtc: string;
}

export interface StopRecordingResponse {
  sessionId: string;
  recording: RecordingInfoDto;
}

export interface VideoSessionDto {
  id: string;
  appointmentId: string;
  channelName: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  participants: VideoSessionParticipant[];
  recording?: RecordingInfoDto | null;
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
