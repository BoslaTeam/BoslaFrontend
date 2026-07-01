import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import type { Signal } from '@angular/core';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraService } from '@core/services/agora.service';
import { DeviceErrorMessages, DevicePermissionState } from '../models/device-info.model';
import type { VideoDeviceInfo, AudioInputDeviceInfo, AudioOutputDeviceInfo } from '../models/device-info.model';

@Injectable({ providedIn: 'root' })
export class VideoDeviceService {
  private readonly agoraService = inject(AgoraService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Private state ──────────────────────────────────────────────

  private readonly _videoInputs = signal<VideoDeviceInfo[]>([]);
  private readonly _audioInputs = signal<AudioInputDeviceInfo[]>([]);
  private readonly _audioOutputs = signal<AudioOutputDeviceInfo[]>([]);

  private readonly _selectedCameraId = signal<string | null>(null);
  private readonly _selectedMicrophoneId = signal<string | null>(null);
  private readonly _selectedSpeakerId = signal<string | null>(null);

  private readonly _permissions = signal<DevicePermissionState>({ camera: null, microphone: null });
  private readonly _errors = signal<DeviceErrorMessages>({ camera: null, microphone: null, speaker: null });

  // ── Public readonly API ────────────────────────────────────────

  readonly videoInputs: Signal<ReadonlyArray<VideoDeviceInfo>> = this._videoInputs.asReadonly();
  readonly audioInputs: Signal<ReadonlyArray<AudioInputDeviceInfo>> = this._audioInputs.asReadonly();
  readonly audioOutputs: Signal<ReadonlyArray<AudioOutputDeviceInfo>> = this._audioOutputs.asReadonly();

  readonly selectedCameraId: Signal<string | null> = this._selectedCameraId.asReadonly();
  readonly selectedMicrophoneId: Signal<string | null> = this._selectedMicrophoneId.asReadonly();
  readonly selectedSpeakerId: Signal<string | null> = this._selectedSpeakerId.asReadonly();

  readonly permissions: Signal<DevicePermissionState> = this._permissions.asReadonly();
  readonly errors: Signal<DeviceErrorMessages> = this._errors.asReadonly();

  readonly hasAudioOutputSupport: Signal<boolean> = computed(() => {
    return typeof HTMLAudioElement !== 'undefined' && typeof AudioContext !== 'undefined';
  });

  readonly selectedCamera: Signal<VideoDeviceInfo | null> = computed(() => {
    const id = this._selectedCameraId();
    if (!id) return null;
    return this._videoInputs().find(d => d.deviceId === id) ?? null;
  });

  readonly selectedMicrophone: Signal<AudioInputDeviceInfo | null> = computed(() => {
    const id = this._selectedMicrophoneId();
    if (!id) return null;
    return this._audioInputs().find(d => d.deviceId === id) ?? null;
  });

  readonly selectedSpeaker: Signal<AudioOutputDeviceInfo | null> = computed(() => {
    const id = this._selectedSpeakerId();
    if (!id) return null;
    return this._audioOutputs().find(d => d.deviceId === id) ?? null;
  });

  // ── Initialization ─────────────────────────────────────────────

  constructor() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.enumerateDevices();
      });
    }

    this.destroyRef.onDestroy(() => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', () => {
          this.enumerateDevices();
        });
      }
    });
  }

  // ── Device enumeration ─────────────────────────────────────────

  async enumerateDevices(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      this._errors.update(e => ({ ...e, camera: 'المتصفح لا يدعم الوصول إلى الأجهزة.', microphone: 'المتصفح لا يدعم الوصول إلى الأجهزة.' }));
      return;
    }

    try {
      const rawDevices = await navigator.mediaDevices.enumerateDevices();

      const videoInputs: VideoDeviceInfo[] = [];
      const audioInputs: AudioInputDeviceInfo[] = [];
      const audioOutputs: AudioOutputDeviceInfo[] = [];

      for (const d of rawDevices) {
        const device = {
          deviceId: d.deviceId,
          label: d.label || this.fallbackLabel(d.kind),
          groupId: d.groupId,
        };

        if (d.kind === 'videoinput') {
          videoInputs.push({ ...device, kind: 'videoinput' as const });
        } else if (d.kind === 'audioinput') {
          audioInputs.push({ ...device, kind: 'audioinput' as const });
        } else if (d.kind === 'audiooutput') {
          audioOutputs.push({ ...device, kind: 'audiooutput' as const });
        }
      }

      this._videoInputs.set(videoInputs);
      this._audioInputs.set(audioInputs);
      this._audioOutputs.set(audioOutputs);

      // Auto-select if current selection is gone
      this.ensureValidSelection('camera', videoInputs);
      this.ensureValidSelection('microphone', audioInputs);
      this.ensureValidSelection('speaker', audioOutputs);

      this._errors.update(e => ({
        camera: videoInputs.length === 0 ? 'لم يتم العثور على كاميرا.' : null,
        microphone: audioInputs.length === 0 ? 'لم يتم العثور على ميكروفون.' : null,
        speaker: null,
      }));
    } catch (err) {
      console.error('[VideoDeviceService] enumerateDevices failed', err);
    }
  }

  // ── Device selection ───────────────────────────────────────────

  async selectCamera(deviceId: string): Promise<void> {
    this._selectedCameraId.set(deviceId);
    this._errors.update(e => ({ ...e, camera: null }));

    if (this.agoraService.joined()) {
      try {
        await this.agoraService.switchCamera(deviceId);
      } catch {
        this._errors.update(e => ({ ...e, camera: 'فشل تبديل الكاميرا.' }));
      }
    }
  }

  async selectMicrophone(deviceId: string): Promise<void> {
    this._selectedMicrophoneId.set(deviceId);
    this._errors.update(e => ({ ...e, microphone: null }));

    if (this.agoraService.joined()) {
      try {
        await this.agoraService.switchMicrophone(deviceId);
      } catch {
        this._errors.update(e => ({ ...e, microphone: 'فشل تبديل الميكروفون.' }));
      }
    }
  }

  async selectSpeaker(deviceId: string): Promise<void> {
    this._selectedSpeakerId.set(deviceId);
  }

  // ── Permission handling ────────────────────────────────────────

  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      for (const track of stream.getTracks()) {
        track.stop();
      }
      this._permissions.update(p => ({ ...p, camera: true }));
      this._errors.update(e => ({ ...e, camera: null }));
      await this.enumerateDevices();
      return true;
    } catch (err) {
      const msg = String(err);
      if (msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
        this._errors.update(e => ({ ...e, camera: 'لم يتم السماح باستخدام الكاميرا.' }));
      } else {
        this._errors.update(e => ({ ...e, camera: 'تعذر الوصول إلى الكاميرا.' }));
      }
      this._permissions.update(p => ({ ...p, camera: false }));
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) {
        track.stop();
      }
      this._permissions.update(p => ({ ...p, microphone: true }));
      this._errors.update(e => ({ ...e, microphone: null }));
      await this.enumerateDevices();
      return true;
    } catch (err) {
      const msg = String(err);
      if (msg.includes('NotAllowed') || msg.includes('PermissionDenied')) {
        this._errors.update(e => ({ ...e, microphone: 'لم يتم السماح باستخدام الميكروفون.' }));
      } else {
        this._errors.update(e => ({ ...e, microphone: 'تعذر الوصول إلى الميكروفون.' }));
      }
      this._permissions.update(p => ({ ...p, microphone: false }));
      return false;
    }
  }

  async requestAllPermissions(): Promise<void> {
    await this.requestCameraPermission();
    await this.requestMicrophonePermission();
    await this.enumerateDevices();
  }

  // ── Internal ───────────────────────────────────────────────────

  private ensureValidSelection(
    kind: 'camera' | 'microphone' | 'speaker',
    available: { deviceId: string }[],
  ): void {
    const selectedId = kind === 'camera'
      ? this._selectedCameraId()
      : kind === 'microphone'
        ? this._selectedMicrophoneId()
        : this._selectedSpeakerId();

    if (selectedId && available.some(d => d.deviceId === selectedId)) return;

    const fallback = available[0]?.deviceId ?? null;
    if (kind === 'camera') {
      this._selectedCameraId.set(fallback);
    } else if (kind === 'microphone') {
      this._selectedMicrophoneId.set(fallback);
    } else {
      this._selectedSpeakerId.set(fallback);
    }
  }

  private fallbackLabel(kind: MediaDeviceKind): string {
    if (kind === 'videoinput') return 'كاميرا';
    if (kind === 'audioinput') return 'ميكروفون';
    return 'سماعة';
  }
}
