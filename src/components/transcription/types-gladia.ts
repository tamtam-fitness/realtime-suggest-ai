/**
 * Gladia Transcription Types
 */

export interface TranscriptMessage {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
  language?: string;
}

export interface UseGladiaOptions {
  apiKey: string;
  sampleRate?: number;
}

export interface UseGladiaReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  messages: TranscriptMessage[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendAudioData: (audioData: Uint8Array) => void;
  clearMessages: () => void;
}

/**
 * Gladia V2 API Types
 */
export interface GladiaV2InitRequest {
  encoding: string;
  bit_depth: number;
  sample_rate: number;
  channels: number;
  language_config?: {
    languages: string[];
    code_switching?: boolean;
  };
}

export interface GladiaV2InitResponse {
  id: string;
  url: string; // WebSocket URL
}

// V1形式（廃止）
// export interface GladiaAudioMessage {
//   frames: string;
// }

// V2形式
export interface GladiaV2AudioMessage {
  type: "audio_chunk";
  data: {
    chunk: string; // base64 encoded audio data
  };
}

// V2 形式のメッセージ
export interface GladiaV2TranscriptMessage {
  type: "transcript";
  session_id: string;
  created_at: string;
  data: {
    id: string;
    is_final: boolean;
    utterance: {
      text: string;
      language: string;
      confidence?: number;
    };
  };
}

export interface GladiaV2ErrorMessage {
  type: "error";
  session_id: string;
  created_at: string;
  data: {
    code?: string;
    message: string;
  };
}

export interface GladiaV2AudioChunkAck {
  type: "audio_chunk";
  acknowledged: boolean;
  session_id: string;
  created_at: string;
  data: any;
}

export interface GladiaV2SpeechEvent {
  type: "speech_start" | "speech_end";
  session_id: string;
  created_at: string;
  data: any;
}

export type GladiaMessage =
  | GladiaV2TranscriptMessage
  | GladiaV2ErrorMessage
  | GladiaV2AudioChunkAck
  | GladiaV2SpeechEvent;
