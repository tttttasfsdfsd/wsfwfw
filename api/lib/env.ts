import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string, defaultVal = ""): string {
  return process.env[name] ?? defaultVal;
}

export const env = {
  appId: optional("APP_ID", "finance-ai-cfo"),
  appSecret: optional("APP_SECRET", "dev-secret"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: optional("DATABASE_URL"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
};
