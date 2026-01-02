export const Config = {
  // This is where the Gemini API key goes.
  // Since we cannot expose a real key in this repo, we will use a placeholder.
  // The AIService will detect this placeholder and switch to "Mock Mode".
  // Users who want to use the real AI should replace this string with their valid key.
  GEMINI_API_KEY: "PLACEHOLDER_KEY_REPLACE_ME",

  // Feature flags
  USE_MOCK_AI: true, // Will automatically be set to true if key is placeholder
};
