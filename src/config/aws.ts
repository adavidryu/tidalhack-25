import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
  },
});

// Model configuration
export const MODEL_ID = "anthropic.claude-v2"; // or your preferred model 