import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Circle, Square, Monitor, Users } from "lucide-react";
import { useGladia } from "./useGladia";
import { TranscriptionDisplay } from "./TranscriptionDisplay";

type AudioSourceType = "microphone" | "system" | "both";

/**
 * AudioCaptureWithTranscription Component
 *
 * 音声キャプチャとGladiaのリアルタイム文字起こしを統合したコンポーネント
 */
export function AudioCaptureWithTranscription() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioSourceType | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const systemStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Gladia統合用の追加ref
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // GladiaのAPIキーを環境変数から取得
  const apiKey = import.meta.env.VITE_GLADIA_API_KEY;

  // Gladia hook
  const gladia = useGladia({
    apiKey,
    sampleRate: 16000,
  });

  const startVisualization = (
    audioContext: AudioContext,
    analyser: AnalyserNode,
  ) => {
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = "rgb(0, 0, 0)";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "rgb(0, 255, 0)";
      canvasContext.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const canvasContext = canvas.getContext("2d");
      if (canvasContext) {
        canvasContext.fillStyle = "rgb(0, 0, 0)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  /**
   * Gladiaにリアルタイムで音声データを送信するための処理
   */
  const setupAudioProcessor = (
    audioContext: AudioContext,
    stream: MediaStream,
  ) => {
    const source = audioContext.createMediaStreamSource(stream);

    // ScriptProcessorNodeで音声データを取得（16kHzにリサンプリング）
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);

      // Float32Array → Int16Array に変換（Gladia要件）
      const int16Array = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Gladiaに送信
      gladia.sendAudioData(new Uint8Array(int16Array.buffer));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    processorRef.current = processor;
  };

  const createMixedStream = async (
    micStream: MediaStream | null,
    systemStream: MediaStream | null,
  ): Promise<{ mixedStream: MediaStream; audioContext: AudioContext }> => {
    const audioContext = new AudioContext({ sampleRate: 16000 }); // Gladia推奨
    const destination = audioContext.createMediaStreamDestination();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.85;

    if (micStream) {
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
      micSource.connect(analyser);
    }

    if (systemStream) {
      const systemSource = audioContext.createMediaStreamSource(systemStream);
      systemSource.connect(destination);
      systemSource.connect(analyser);
    }

    startVisualization(audioContext, analyser);

    // Gladia用のaudio processor設定
    setupAudioProcessor(audioContext, destination.stream);

    return { mixedStream: destination.stream, audioContext };
  };

  const handleStartCapture = async (sourceType: AudioSourceType) => {
    try {
      setError(null);
      setAudioSource(sourceType);

      let micStream: MediaStream | null = null;
      let systemStream: MediaStream | null = null;

      // マイク取得
      if (sourceType === "microphone" || sourceType === "both") {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = micStream;
      }

      // システム音声取得
      if (sourceType === "system" || sourceType === "both") {
        systemStream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true,
        });

        systemStream.getVideoTracks().forEach((track) => track.stop());
        systemStreamRef.current = systemStream;
      }

      // ストリームをミックス
      const { mixedStream } = await createMixedStream(micStream, systemStream);
      mixedStreamRef.current = mixedStream;

      // Gladiaに接続
      await gladia.connect();

      setIsCapturing(true);
    } catch (err) {
      console.error("Failed to capture audio:", err);
      setError(err instanceof Error ? err.message : "Failed to capture audio");

      // クリーンアップ
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (systemStreamRef.current) {
        systemStreamRef.current.getTracks().forEach((track) => track.stop());
        systemStreamRef.current = null;
      }
    }
  };

  const handleStopCapture = async () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (systemStreamRef.current) {
      systemStreamRef.current.getTracks().forEach((track) => track.stop());
      systemStreamRef.current = null;
    }

    if (mixedStreamRef.current) {
      mixedStreamRef.current.getTracks().forEach((track) => track.stop());
      mixedStreamRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    stopVisualization();
    setIsCapturing(false);
    setAudioSource(null);

    if (isRecording) {
      handleStopRecording();
    }

    // Gladiaから切断
    await gladia.disconnect();
  };

  const handleStartRecording = () => {
    if (!mixedStreamRef.current) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(mixedStreamRef.current, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start recording",
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isCapturing) {
        handleStopCapture();
      }
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 音声波形ビジュアライゼーション */}
      <div className="bg-background relative overflow-hidden rounded-lg border">
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="h-[200px] w-full"
        />
        {!isCapturing && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            音声ソースを選択してキャプチャを開始
          </div>
        )}
      </div>

      {/* 音声ソース選択 */}
      {!isCapturing && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => handleStartCapture("microphone")}
            variant="outline"
          >
            <Mic className="mr-2 h-4 w-4" />
            マイクのみ
          </Button>

          <Button
            onClick={() => handleStartCapture("system")}
            variant="outline"
          >
            <Monitor className="mr-2 h-4 w-4" />
            システム音声のみ
          </Button>

          <Button onClick={() => handleStartCapture("both")} variant="default">
            <Users className="mr-2 h-4 w-4" />
            両方（ミーティング用）
          </Button>
        </div>
      )}

      {/* コントロールボタン */}
      {isCapturing && (
        <div className="flex justify-center gap-2">
          <Button onClick={handleStopCapture} variant="destructive">
            <MicOff className="mr-2 h-4 w-4" />
            キャプチャ停止
          </Button>

          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "secondary"}
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                録音停止
              </>
            ) : (
              <>
                <Circle className="mr-2 h-4 w-4" />
                録音開始
              </>
            )}
          </Button>
        </div>
      )}

      {/* ステータス表示 */}
      <div className="text-muted-foreground text-center text-sm">
        {isCapturing && audioSource === "microphone" && "🎤 マイク入力中..."}
        {isCapturing && audioSource === "system" && "🔊 システム音声入力中..."}
        {isCapturing &&
          audioSource === "both" &&
          "🎤🔊 マイク + システム音声入力中..."}
        {isRecording && " 🔴 録音中..."}
        {error && <div className="text-destructive mt-2">エラー: {error}</div>}
        {gladia.error && (
          <div className="text-destructive mt-2">
            Gladia エラー: {gladia.error}
          </div>
        )}
      </div>

      {/* 文字起こし結果表示 */}
      <TranscriptionDisplay
        messages={gladia.messages}
        isConnected={gladia.isConnected}
      />
    </div>
  );
}
