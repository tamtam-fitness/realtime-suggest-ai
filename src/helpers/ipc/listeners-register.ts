import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { registerAudioListeners } from "./audio/audio-listeners";
import { registerAssemblyAIListeners } from "./assemblyai/assemblyai-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  registerAudioListeners();
  registerAssemblyAIListeners();
}
