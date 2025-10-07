export interface AudioCaptureAPI {
  startCapture: () => Promise<{ success: boolean; error?: string }>;
  stopCapture: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    audioCapture: AudioCaptureAPI;
  }
}
