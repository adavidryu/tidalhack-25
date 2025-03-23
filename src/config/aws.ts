import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Model configuration
export const MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";