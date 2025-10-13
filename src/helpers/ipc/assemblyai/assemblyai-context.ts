import { ASSEMBLYAI_GENERATE_TOKEN_CHANNEL } from "./assemblyai-channels";

export function exposeAssemblyAIContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("assemblyAI", {
    generateToken: (apiKey: string, expiresInSeconds: number) =>
      ipcRenderer.invoke(ASSEMBLYAI_GENERATE_TOKEN_CHANNEL, apiKey, expiresInSeconds),
  });
}
