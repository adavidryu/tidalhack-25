import { NextResponse } from 'next/server';
import { bedrockClient } from '@/config/aws';
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { MODEL_ID } from '@/config/aws';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the system message and the last user message
    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessage = messages.find(msg => msg.role === 'user');

    if (!userMessage) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      );
    }

    // Format the prompt with both system message and user message
    const prompt = `${systemMessage ? `System: ${systemMessage.content}\n\n` : ''}Human: ${userMessage.content}\n\nAssistant:`;

    console.log('Sending prompt to Bedrock:', prompt);

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 500,
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    try {
      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      console.log('Received response from Bedrock:', responseBody);
      return NextResponse.json({ response: responseBody.completion });
    } catch (bedrockError: any) {
      console.error('Bedrock API Error:', bedrockError);
      return NextResponse.json(
        { error: 'Failed to get response from AI model', details: bedrockError?.message || 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 