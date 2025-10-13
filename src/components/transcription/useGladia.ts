import { useState, useRef, useCallback } from "react";
import type {
  TranscriptMessage,
  UseGladiaOptions,
  UseGladiaReturn,
  GladiaV2InitRequest,
  GladiaV2InitResponse,
  GladiaV2AudioMessage,
  GladiaMessage,
} from "./types-gladia";

/**
 * Gladia Realtime Transcription Hook (Raw WebSocket Implementation)
 */
export function useGladia(options: UseGladiaOptions): UseGladiaReturn {
  const { apiKey, sampleRate = 16000 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  /**
   * Gladiaに接続 (V2 API)
   */
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      console.warn("Already connected or connecting");
      return;
    }

    if (!apiKey) {
      setError("API key is missing");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      console.log("🔧 Initializing Gladia V2 session...");

      // Step 1: POST /v2/live でWebSocket URLを取得
      const initRequest: GladiaV2InitRequest = {
        encoding: "wav/pcm",
        bit_depth: 16,
        sample_rate: sampleRate,
        channels: 1,
        language_config: {
          languages: ["ja"], // 日本語を明示的に指定
          code_switching: false,
        },
      };

      console.log("📤 Sending init request:", initRequest);

      const initResponse = await fetch("https://api.gladia.io/v2/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gladia-key": apiKey,
        },
        body: JSON.stringify(initRequest),
      });

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        throw new Error(`Failed to initialize session: ${initResponse.status} - ${errorText}`);
      }

      const initData: GladiaV2InitResponse = await initResponse.json();
      console.log("✅ Session initialized:", initData);

      // Step 2: WebSocket接続
      const wsUrl = initData.url;
      console.log("🔧 Connecting to WebSocket:", wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected to Gladia V2");
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: GladiaMessage = JSON.parse(event.data);
          console.log("📨 Received from Gladia V2:", message);

          // エラーメッセージ
          if (message.type === "error") {
            console.error(`❌ Gladia Error [${message.data.code}]: ${message.data.message}`);
            setError(`Gladia Error: ${message.data.message}`);
            ws.close();
            return;
          }

          // 音声チャンクの確認応答（無視）
          if (message.type === "audio_chunk") {
            return;
          }

          // 音声検出イベント
          if (message.type === "speech_start") {
            console.log("🎤 Speech detected!");
            return;
          }

          if (message.type === "speech_end") {
            console.log("🎤 Speech ended");
            return;
          }

          // 文字起こし結果
          if (message.type === "transcript" && message.data.transcription) {
            const isFinal = message.data.is_final;
            const text = message.data.transcription;

            console.log(`${isFinal ? "final" : "partial"}: (${message.data.language}) ${text}`);

            const newMessage: TranscriptMessage = {
              id: isFinal ? `final-${Date.now()}` : `partial-${Date.now()}`,
              text: text,
              timestamp: Date.now(),
              isFinal: isFinal,
              language: message.data.language,
            };

            setMessages((prev) => {
              // 部分的なトランスクリプトの場合、最後のメッセージが部分的なものなら置き換える
              if (!newMessage.isFinal && prev.length > 0 && !prev[prev.length - 1].isFinal) {
                return [...prev.slice(0, -1), newMessage];
              }
              return [...prev, newMessage];
            });
          }
        } catch (parseError) {
          console.error("❌ Failed to parse message:", parseError);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        setError("WebSocket connection error");
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log(`❌ WebSocket closed: ${event.code} - ${event.reason}`);

        // エラーメッセージを設定
        if (event.code !== 1000) {
          // 1000 = 正常終了
          setError(`Connection closed: ${event.code} - ${event.reason || "Unknown reason"}`);
        }

        setIsConnected(false);
        setIsConnecting(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to connect to Gladia:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnecting(false);
    }
  }, [apiKey, sampleRate, isConnected, isConnecting]);

  /**
   * 切断
   */
  const disconnect = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  /**
   * 音声データをGladia V2に送信
   */
  const sendAudioData = useCallback((audioData: Uint8Array) => {
    // WebSocketの実際のreadyStateを確認
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Uint8ArrayをBase64に変換
    const base64Audio = btoa(
      Array.from(audioData)
        .map((byte) => String.fromCharCode(byte))
        .join("")
    );

    // Gladia V2のメッセージフォーマット
    const audioMessage: GladiaV2AudioMessage = {
      type: "audio_chunk",
      data: {
        chunk: base64Audio,
      },
    };

    // デバッグ: 最初の数回だけログ出力
    if (Math.random() < 0.01) { // 1%の確率でログ
      console.log("🎤 Sending audio chunk:", {
        size: audioData.length,
        base64Length: base64Audio.length,
        sample: base64Audio.substring(0, 50) + "...",
      });
    }

    // JSON文字列として送信
    wsRef.current.send(JSON.stringify(audioMessage));
  }, []);

  /**
   * メッセージをクリア
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    messages,
    connect,
    disconnect,
    sendAudioData,
    clearMessages,
  };
}
