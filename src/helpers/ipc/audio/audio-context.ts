import {
  AUDIO_CAPTURE_START_CHANNEL,
  AUDIO_CAPTURE_STOP_CHANNEL,
} from "./audio-channels";

export function exposeAudioContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("audioCapture", {
    startCapture: () => ipcRenderer.invoke(AUDIO_CAPTURE_START_CHANNEL),
    stopCapture: () => ipcRenderer.invoke(AUDIO_CAPTURE_STOP_CHANNEL),
  });
}
