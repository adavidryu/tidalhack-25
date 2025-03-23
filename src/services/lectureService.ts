import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockAgentRuntimeClient, RetrieveCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { MODEL_ID } from '@/config/aws';

interface Topic {
  id: string;
  title: string;
  description: string;
  examples: string[];
  keyConcepts: string[];
}

interface WeekMetadata {
  weekNumber: number;
  topics: Topic[];
  difficultyLevels: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  weekNumber: number;
  hints: string[];
  testCases: {
    input: string;
    output: string;
    description: string;
  }[];
}

export class LectureService {
  private s3Client: S3Client;
  private bedrockClient: BedrockRuntimeClient;
  private bedrockAgentClient: BedrockAgentRuntimeClient;
  private bucketName: string;
  private knowledgeBaseId: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bedrockAgentClient = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
    this.knowledgeBaseId = process.env.AWS_KNOWLEDGE_BASE_ID!;
  }

  async getWeekMetadata(weekNumber: number): Promise<WeekMetadata> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `lectures/week${weekNumber}/topics.json`,
    });

    const response = await this.s3Client.send(command);
    const content = await response.Body?.transformToString();
    return JSON.parse(content || '{}');
  }

  async getExampleContent(weekNumber: number, exampleId: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `lectures/week${weekNumber}/examples/${exampleId}.md`,
    });

    const response = await this.s3Client.send(command);
    return await response.Body?.transformToString() || '';
  }

  async generateProblem(
    weekId: number | string,
    difficulty: 'easy' | 'medium' | 'hard',
    problemType: 'MCQ' | 'FRQ' = 'FRQ'
  ): Promise<Problem> {
    // Construct the query based on week/exam
    const contentType = typeof weekId === 'string' ? 'exam' : 'week';
    const contentNumber = typeof weekId === 'string' ? weekId.replace('exam', '') : weekId;
    
    // Get relevant content from Knowledge Base
    const knowledgeBaseCommand = new RetrieveCommand({
      knowledgeBaseId: this.knowledgeBaseId,
      retrievalQuery: {
        text: `${contentType} ${contentNumber} ${difficulty} ${problemType}`
      },
      retrievalConfiguration: {
        vectorSearchConfiguration: {
          numberOfResults: 5
        }
      }
    });

    const knowledgeBaseResponse = await this.bedrockAgentClient.send(knowledgeBaseCommand);
    const knowledgeBaseResults = knowledgeBaseResponse.retrievalResults?.map(result => ({
      text: result.content || '',
      score: result.score || 0,
      metadata: result.metadata as { weekNumber: number; topic: string; difficulty: string; type: string }
    })) || [];

    // Create a prompt for problem generation
    const prompt = `Generate a ${difficulty} difficulty ${problemType} problem for CSCE 120 ${contentType} ${contentNumber}. 
    Use this context as reference: ${knowledgeBaseResults.map(result => result.text).join('\n\n')}
    
    The problem should:
    1. Be appropriate for ${difficulty} difficulty level. Base/Medium level matches difficulty level of reference material.
    2. Be in ${problemType} format (${problemType === 'MCQ' ? 'multiple choice with 4 options' : 'code writing/tracing question'})
    3. Include clear ${problemType === 'MCQ' ? 'question and answer choices' : 'input/output requirements'}
    4. ${problemType === 'MCQ' ? 'Include explanation for correct answer' : 'Have multiple test cases'}
    5. Include helpful hints
    
    Format the response as a JSON object with the following structure:
    {
      "id": "unique-id",
      "title": "Problem Title",
      "description": "Detailed problem description",
      "difficulty": "${difficulty}",
      "type": "${problemType}",
      "category": "${contentType === 'exam' ? 'Exam ' + contentNumber : 'Week ' + contentNumber}",
      ${problemType === 'MCQ' ? 
        '"choices": ["A) choice1", "B) choice2", "C) choice3", "D) choice4"], "correctAnswer": "A", "explanation": "Why this answer is correct"' : 
        '"testCases": [{"input": "test input", "output": "expected output", "description": "what this test case verifies"}]'
      },
      "hints": ["hint1", "hint2", "hint3"]
    }`;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        anthropic_version: "bedrock-2023-05-31"
      }),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Raw Bedrock response:', responseBody);
    
    // Handle the Messages API format for Claude 3.5
    if (!responseBody.content || !Array.isArray(responseBody.content)) {
      // If not in content, check messages array
      if (!responseBody.messages?.[0]?.content || !Array.isArray(responseBody.messages[0].content)) {
        throw new Error(`Invalid response format from Bedrock: ${JSON.stringify(responseBody)}`);
      }
      // Get content from messages array
      const textContent = responseBody.messages[0].content.find(
        (item: { type: string; text: string }) => item.type === 'text'
      )?.text;
      if (!textContent) {
        throw new Error(`No text content found in response: ${JSON.stringify(responseBody)}`);
      }
      return JSON.parse(textContent);
    }

    // If in content array directly
    const textContent = responseBody.content.find(
      (item: { type: string; text: string }) => item.type === 'text'
    )?.text;
    if (!textContent) {
      throw new Error(`No text content found in response: ${JSON.stringify(responseBody)}`);
    }
    return JSON.parse(textContent);
  }

  async getAvailableTopics(weekNumber: number): Promise<Topic[]> {
    const weekMetadata = await this.getWeekMetadata(weekNumber);
    return weekMetadata.topics;
  }
} 