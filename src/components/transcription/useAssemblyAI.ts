import { useState, useRef, useCallback } from "react";
import type {
  TranscriptMessage,
  UseAssemblyAIOptions,
  UseAssemblyAIReturn,
} from "./types";
import { assemblyAIApi } from "@/helpers/ipc/assemblyai";

/**
 * AssemblyAI Realtime Transcription Hook (Raw WebSocket Implementation)
 *
 * SDKのバグを回避するため、直接WebSocket APIを使用
 */
export function useAssemblyAI(options: UseAssemblyAIOptions): UseAssemblyAIReturn {
  const { apiKey, sampleRate = 16000 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  /**
   * AssemblyAIに接続
   */
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      console.warn("Already connected or connecting");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 一時トークンを生成（IPC経由でメインプロセスから取得）
      console.log("🔑 Generating temporary token via IPC...");
      console.log("🔧 API Key:", apiKey ? "exists" : "missing");

      const tokenData = await assemblyAIApi.generateToken(apiKey, 600);
      console.log("✅ Token generated:", tokenData);
      const token = tokenData.token;

      // WebSocketパラメータをURLに追加（v3 API仕様）
      const params = new URLSearchParams({
        sample_rate: sampleRate.toString(),
        encoding: "pcm_s16le",
        language: "ja", // 日本語を指定
        token: token, // 一時トークンを使用
      });

      // WebSocket接続を作成（v3エンドポイント）
      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?${params}`;

      console.log("🔧 Connecting to:", wsUrl);

      // WebSocketを作成（トークン認証なのでサブプロトコル不要）
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📨 Received:", data);

        // セッション開始メッセージ (v3: type="Begin")
        if (data.type === "Begin") {
          console.log(`AssemblyAI session opened: ${data.id}`);
          return;
        }

        // 文字起こし結果 (v3: type="Turn")
        if (data.type === "Turn") {
          // end_of_turnがtrueの場合はFinalTranscript
          const isFinal = data.end_of_turn === true;
          const text = data.transcript; // v3では'transcript'フィールド

          if (!text) return;

          const newMessage: TranscriptMessage = {
            id: isFinal ? `final-${Date.now()}` : `partial-${Date.now()}`,
            text: text,
            timestamp: Date.now(),
            isFinal: isFinal,
          };

          setMessages((prev) => {
            // 部分的なトランスクリプトの場合、最後のメッセージが部分的なものなら置き換える
            if (!newMessage.isFinal && prev.length > 0 && !prev[prev.length - 1].isFinal) {
              return [...prev.slice(0, -1), newMessage];
            }
            return [...prev, newMessage];
          });
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        console.error("❌ Error details:", {
          type: event.type,
          target: event.target,
          readyState: (event.target as WebSocket)?.readyState,
        });
        setError("WebSocket connection error");
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log(`❌ WebSocket closed: ${event.code} - ${event.reason}`);
        console.log(`❌ Close details:`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // エラーメッセージを設定
        if (event.code !== 1000) { // 1000 = 正常終了
          setError(`Connection closed: ${event.code} - ${event.reason || "Unknown reason"}`);
        }

        setIsConnected(false);
        setIsConnecting(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to connect to AssemblyAI:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setIsConnecting(false);
    }
  }, [apiKey, sampleRate, isConnected, isConnecting]);

  /**
   * AssemblyAIから切断
   */
  const disconnect = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  /**
   * 音声データをAssemblyAIに送信
   */
  const sendAudioData = useCallback((audioData: Uint8Array) => {
    // WebSocketの実際のreadyStateを確認（isConnectedではなく）
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // 最初の接続時は大量のログが出るので、ログを抑制
      return;
    }

    // ArrayBufferを送信
    wsRef.current.send(audioData.buffer);
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
