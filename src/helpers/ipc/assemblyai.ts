/**
 * AssemblyAI IPC Helper
 * メインプロセス経由でAssemblyAI APIを呼び出す
 */

export const assemblyAIApi = {
  /**
   * 一時トークンを生成
   */
  generateToken: (apiKey: string, expiresInSeconds: number = 600): Promise<{ token: string; expires_in_seconds: number }> => {
    return window.assemblyAI.generateToken(apiKey, expiresInSeconds);
  },
};
