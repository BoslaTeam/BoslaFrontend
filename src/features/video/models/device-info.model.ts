export interface VideoDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
  kind: 'videoinput';
}

export interface AudioInputDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
  kind: 'audioinput';
}

export interface AudioOutputDeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
  kind: 'audiooutput';
}

export type AnyDeviceInfo = VideoDeviceInfo | AudioInputDeviceInfo | AudioOutputDeviceInfo;

export interface DevicePermissionState {
  camera: boolean | null;
  microphone: boolean | null;
}

export interface DeviceErrorMessages {
  camera: string | null;
  microphone: string | null;
  speaker: string | null;
}
