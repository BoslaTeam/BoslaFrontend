import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import type { Signal } from '@angular/core';
import { AgoraService } from '@core/services/agora.service';
import { DeviceErrorMessages, DevicePermissionState } from '../models/device-info.model';
import type { VideoDeviceInfo, AudioInputDeviceInfo, AudioOutputDeviceInfo } from '../models/device-info.model';

const STORAGE_KEY_CAMERA = 'bosla_selected_camera';
const STORAGE_KEY_MICROPHONE = 'bosla_selected_microphone';
const STORAGE_KEY_SPEAKER = 'bosla_selected_speaker';

@Injectable({ providedIn: 'root' })
export class VideoDeviceService {
  private readonly agoraService = inject(AgoraService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Private state ──────────────────────────────────────────────

  private readonly _videoInputs = signal<VideoDeviceInfo[]>([]);
  private readonly _audioInputs = signal<AudioInputDeviceInfo[]>([]);
  private readonly _audioOutputs = signal<AudioOutputDeviceInfo[]>([]);

  private readonly _selectedCameraId = signal<string | null>(this.loadSaved(STORAGE_KEY_CAMERA));
  private readonly _selectedMicrophoneId = signal<string | null>(this.loadSaved(STORAGE_KEY_MICROPHONE));
  private readonly _selectedSpeakerId = signal<string | null>(this.loadSaved(STORAGE_KEY_SPEAKER));

  private readonly _permissions = signal<DevicePermissionState>({ camera: null, microphone: null });
  private readonly _errors = signal<DeviceErrorMessages>({ camera: null, microphone: null, speaker: null });

  /** Tracks whether we've ever received labelled devices after permission grant. */
  private readonly _labelsRevealed = signal(false);

  private deviceChangeTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Public readonly API ────────────────────────────────────────

  readonly videoInputs: Signal<ReadonlyArray<VideoDeviceInfo>> = this._videoInputs.asReadonly();
  readonly audioInputs: Signal<ReadonlyArray<AudioInputDeviceInfo>> = this._audioInputs.asReadonly();
  readonly audioOutputs: Signal<ReadonlyArray<AudioOutputDeviceInfo>> = this._audioOutputs.asReadonly();

  readonly selectedCameraId: Signal<string | null> = this._selectedCameraId.asReadonly();
  readonly selectedMicrophoneId: Signal<string | null> = this._selectedMicrophoneId.asReadonly();
  readonly selectedSpeakerId: Signal<string | null> = this._selectedSpeakerId.asReadonly();

  readonly permissions: Signal<DevicePermissionState> = this._permissions.asReadonly();
  readonly errors: Signal<DeviceErrorMessages> = this._errors.asReadonly();
  readonly labelsRevealed: Signal<boolean> = this._labelsRevealed.asReadonly();

  /**
   * True when the browser supports `HTMLMediaElement.setSinkId()` — the actual
   * API required to change the audio output device.
   */
  readonly hasAudioOutputSupport: Signal<boolean> = computed(() => {
    return typeof HTMLAudioElement !== 'undefined'
      && 'setSinkId' in HTMLAudioElement.prototype;
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

  readonly cameraLabelsAvailable: Signal<boolean> = computed(() => {
    return this._permissions().camera === true && this._labelsRevealed();
  });

  readonly microphoneLabelsAvailable: Signal<boolean> = computed(() => {
    return this._permissions().microphone === true && this._labelsRevealed();
  });

  // ── Initialization ─────────────────────────────────────────────

  constructor() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
    }

    this.destroyRef.onDestroy(() => {
      if (this.deviceChangeTimer !== null) {
        clearTimeout(this.deviceChangeTimer);
        this.deviceChangeTimer = null;
      }
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', this.onDeviceChange);
      }
    });
  }

  /** Debounced handler for hardware change events. */
  private readonly onDeviceChange = (): void => {
    if (this.deviceChangeTimer !== null) {
      clearTimeout(this.deviceChangeTimer);
    }
    this.deviceChangeTimer = setTimeout(() => {
      this.deviceChangeTimer = null;
      this.enumerateDevices();
    }, 250);
  };

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

      let hasRealLabels = false;

      for (const d of rawDevices) {
        const hasLabel = d.label && d.label.length > 0 && !d.label.startsWith('Camera ') && !d.label.startsWith('Microphone ');
        if (hasLabel) hasRealLabels = true;

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

      if (hasRealLabels) {
        this._labelsRevealed.set(true);
      }

      this._videoInputs.set(videoInputs);
      this._audioInputs.set(audioInputs);
      this._audioOutputs.set(audioOutputs);

      // Restore saved selections before fallback
      this.restoreSavedSelection('camera', videoInputs);
      this.restoreSavedSelection('microphone', audioInputs);
      this.restoreSavedSelection('speaker', audioOutputs);

      // Fallback if still no selection
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
    this.persistSelection(STORAGE_KEY_CAMERA, deviceId);
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
    this.persistSelection(STORAGE_KEY_MICROPHONE, deviceId);
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
    this.persistSelection(STORAGE_KEY_SPEAKER, deviceId);
  }

  // ── Permission synchronization ─────────────────────────────────

  /**
   * Synchronizes the service permission state with the actual browser/Agora state.
   *
   * Detection priority (each level only runs if the previous left a `null`):
   *
   * 1. **Permissions API** (`navigator.permissions.query`)
   *    - Supported in Chrome, Edge, Firefox.
   *    - Returns 'granted', 'denied', or 'prompt'.
   *    - 'prompt' means the user hasn't decided yet — treated as null.
   *
   * 2. **Label inference** (device labels from `enumerateDevices`)
   *    - If real hardware labels exist, permissions must have been granted.
   *    - Works in all modern browsers after any `getUserMedia` call succeeded.
   *
   * 3. **Agora joined state**
   *    - If `agoraService.joined()` is true, Agora has already obtained
   *      local video/audio tracks → permissions are definitely granted.
   *
   * Call this after Agora successfully creates/publishes tracks, or after
   * any feature (screen share, background blur, etc.) acquires media.
   */
  async refreshPermissions(): Promise<void> {
    let camera = this._permissions().camera;
    let microphone = this._permissions().microphone;

    // 1. Permissions API
    if (navigator.permissions?.query) {
      try {
        const camResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (camResult.state === 'granted') camera = true;
        else if (camResult.state === 'denied') camera = false;
      } catch { /* permission name not supported */ }
      try {
        const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (micResult.state === 'granted') microphone = true;
        else if (micResult.state === 'denied') microphone = false;
      } catch { /* permission name not supported */ }
    }

    // 2. Label inference — real labels mean permission was granted
    if (camera === null || microphone === null) {
      try {
        const rawDevices = await navigator.mediaDevices.enumerateDevices();
        for (const d of rawDevices) {
          const hasRealLabel = d.label && d.label.length > 0
            && !d.label.startsWith('Camera ')
            && !d.label.startsWith('Microphone ');
          if (!hasRealLabel) continue;
          if (d.kind === 'videoinput' && camera === null) camera = true;
          if (d.kind === 'audioinput' && microphone === null) microphone = true;
        }
      } catch { /* enumeration failed */ }
    }

    // 3. Agora joined → definitely granted
    if (camera === null && this.agoraService.joined()) camera = true;
    if (microphone === null && this.agoraService.joined()) microphone = true;

    // Update state only if something changed
    const current = this._permissions();
    if (camera !== current.camera || microphone !== current.microphone) {
      this._permissions.set({ camera, microphone });
    }
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

  /** Try to restore a previously saved device selection; no-op if saved device doesn't exist. */
  private restoreSavedSelection(kind: 'camera' | 'microphone' | 'speaker', available: { deviceId: string }[]): void {
    const key = kind === 'camera'
      ? STORAGE_KEY_CAMERA
      : kind === 'microphone'
        ? STORAGE_KEY_MICROPHONE
        : STORAGE_KEY_SPEAKER;

    const saved = this.loadSaved(key);
    if (!saved) return;
    if (available.some(d => d.deviceId === saved)) {
      if (kind === 'camera') this._selectedCameraId.set(saved);
      else if (kind === 'microphone') this._selectedMicrophoneId.set(saved);
      else this._selectedSpeakerId.set(saved);
    }
  }

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

  private persistSelection(key: string, deviceId: string): void {
    try {
      localStorage.setItem(key, deviceId);
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }
  }

  private loadSaved(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private fallbackLabel(kind: MediaDeviceKind): string {
    if (kind === 'videoinput') return 'كاميرا';
    if (kind === 'audioinput') return 'ميكروفون';
    return 'سماعة';
  }
}
