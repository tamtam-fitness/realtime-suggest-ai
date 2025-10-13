import { ipcMain, desktopCapturer, session } from "electron";
import {
  AUDIO_CAPTURE_START_CHANNEL,
  AUDIO_CAPTURE_STOP_CHANNEL,
} from "./audio-channels";

export function registerAudioListeners() {
  // Setup display media request handler for audio capture
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      // Grant access to the first screen found with loopback audio
      callback({ video: sources[0], audio: "loopback" });
    });
  });

  ipcMain.handle(AUDIO_CAPTURE_START_CHANNEL, async () => {
    try {
      return { success: true };
    } catch (error) {
      console.error("Failed to start audio capture:", error);
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(AUDIO_CAPTURE_STOP_CHANNEL, async () => {
    try {
      return { success: true };
    } catch (error) {
      console.error("Failed to stop audio capture:", error);
      return { success: false, error: String(error) };
    }
  });
}
