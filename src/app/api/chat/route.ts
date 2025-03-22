import { NextResponse } from 'next/server';
import { bedrockClient } from '@/config/aws';
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { MODEL_ID } from '@/config/aws';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        prompt: `\n\nHuman: ${message}\n\nAssistant:`,
        max_tokens_to_sample: 500,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return NextResponse.json({ response: responseBody.completion });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 