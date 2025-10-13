/**
 * Transcription domain types
 */

export interface TranscriptMessage {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean; // AssemblyAIの最終テキストかどうか
}

export interface UseAssemblyAIOptions {
  apiKey: string;
  sampleRate?: number;
  formatTurns?: boolean;
}

export interface UseAssemblyAIReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  messages: TranscriptMessage[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendAudioData: (audioData: Uint8Array) => void;
  clearMessages: () => void;
}

export type TranscriptionStatus = "idle" | "connecting" | "connected" | "error";
