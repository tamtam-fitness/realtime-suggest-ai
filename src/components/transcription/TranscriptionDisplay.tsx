import React, { useEffect, useRef } from "react";
import type { TranscriptMessage } from "./types";

interface TranscriptionDisplayProps {
  messages: TranscriptMessage[];
  isConnected: boolean;
}

/**
 * TranscriptionDisplay Component
 *
 * チャット風に文字起こし結果を表示するコンポーネント
 */
export function TranscriptionDisplay({
  messages,
  isConnected,
}: TranscriptionDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-background flex h-[400px] flex-col overflow-hidden rounded-lg border">
      {/* ヘッダー */}
      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "リアルタイム文字起こし中" : "待機中"}
          </span>
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            音声をキャプチャすると、ここに文字起こし結果が表示されます
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${
                message.isFinal ? "opacity-100" : "opacity-60"
              }`}
            >
              {/* タイムスタンプ */}
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>{formatTime(message.timestamp)}</span>
                {!message.isFinal && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    (認識中...)
                  </span>
                )}
              </div>

              {/* メッセージ本文 */}
              <div
                className={`rounded-lg p-3 ${
                  message.isFinal
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
