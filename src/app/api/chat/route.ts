import { NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { MODEL_ID } from '@/config/aws';

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { message, problem, weekId, difficulty, topics } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Construct the system prompt based on the current context
    const systemPrompt = `You are a helpful programming assistant for CSCE 120. You are currently helping with ${typeof weekId === 'string' ? 'exam' : 'week'} ${weekId} content.
${problem ? `Current problem: ${problem.title}\nDifficulty: ${difficulty}\n${problem.description}` : ''}
${topics?.length ? `Relevant topics: ${topics.join(', ')}` : ''}

Your role is to:
1. Help students understand programming concepts
2. Provide clear explanations and examples
3. Guide students through problem-solving
4. Format code blocks with proper syntax highlighting
5. Be encouraging and supportive

When showing code examples, always use proper markdown code blocks with language specification.`;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: systemPrompt
          },
          {
            role: 'assistant',
            content: 'I understand. I will help students with their programming questions, providing clear explanations and properly formatted code examples.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        anthropic_version: 'bedrock-2023-05-31'
      }),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Log the response for debugging
    console.log('Bedrock API Response:', responseBody);
    
    // Handle both possible response formats
    const aiResponse = responseBody.content?.[0]?.text?.trim() || 
                      responseBody.completion?.trim() || 
                      'I apologize, but I encountered an error processing your request.';

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
} 