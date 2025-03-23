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
    const { problem, answer, weekId, difficulty } = await request.json();

    if (!problem || !answer) {
      return NextResponse.json(
        { error: 'Problem and answer are required' },
        { status: 400 }
      );
    }

    const prompt = `You are a programming problem grader. You will be given a problem and a student's answer. Your task is to determine if the answer is correct.

Problem:
${problem.description}

Student's Answer:
${answer}

Week: ${weekId}
Difficulty: ${difficulty}

Please analyze the answer and respond with ONLY "correct" or "incorrect". Do not include any explanation or additional text.`;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
        top_p: 0.1,
        anthropic_version: 'bedrock-2023-05-31'
      })
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Log the response for debugging
    console.log('Bedrock API Response:', responseBody);
    
    // Handle both possible response formats
    const aiResponse = responseBody.content?.[0]?.text?.trim().toLowerCase() || 
                      responseBody.completion?.trim().toLowerCase() || 
                      'incorrect';

    return NextResponse.json({
      isCorrect: aiResponse === 'correct'
    });

  } catch (error: any) {
    console.error('Error verifying answer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify answer' },
      { status: 500 }
    );
  }
} 