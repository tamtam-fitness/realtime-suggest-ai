import { ipcMain } from "electron";
import { ASSEMBLYAI_GENERATE_TOKEN_CHANNEL } from "./assemblyai-channels";

/**
 * AssemblyAI関連のIPCイベントリスナーを登録
 */
export function registerAssemblyAIListeners() {
  /**
   * 一時トークンを生成
   */
  ipcMain.handle(
    ASSEMBLYAI_GENERATE_TOKEN_CHANNEL,
    async (_event, apiKey: string, expiresInSeconds: number = 600) => {
      try {
        console.log("🔑 [Main] Generating AssemblyAI token...");

        const response = await fetch(
          `https://streaming.assemblyai.com/v3/token?expires_in_seconds=${expiresInSeconds}`,
          {
            method: "GET",
            headers: {
              Authorization: apiKey,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [Main] Token generation failed:", errorText);
          throw new Error(`Token generation failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ [Main] Token generated successfully");

        return data;
      } catch (error) {
        console.error("❌ [Main] Error generating token:", error);
        throw error;
      }
    }
  );
}
