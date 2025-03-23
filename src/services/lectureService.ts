import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
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
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });

    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
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
    weekNumber: number,
    difficulty: 'easy' | 'medium' | 'hard',
    topics: string[]
  ): Promise<Problem> {
    const weekMetadata = await this.getWeekMetadata(weekNumber);
    
    // Get relevant examples for the selected topics
    const relevantExamples = await Promise.all(
      weekMetadata.topics
        .filter(topic => topics.includes(topic.id))
        .flatMap(topic => topic.examples)
        .map(exampleId => this.getExampleContent(weekNumber, exampleId))
    );

    // Create a prompt for problem generation
    const prompt = `Generate a ${difficulty} difficulty programming problem for CSCE 120 Week ${weekNumber} based on the following topics: ${topics.join(', ')}. 
    Use these examples as reference: ${relevantExamples.join('\n\n')}
    
    The problem should:
    1. Be appropriate for ${difficulty} difficulty level
    2. Test understanding of the specified topics
    3. Include clear input/output requirements
    4. Have multiple test cases
    5. Include helpful hints
    
    Format the response as a JSON object with the following structure:
    {
      "id": "unique-id",
      "title": "Problem Title",
      "description": "Detailed problem description",
      "difficulty": "${difficulty}",
      "category": "Main topic category",
      "weekNumber": ${weekNumber},
      "hints": ["hint1", "hint2", "hint3"],
      "testCases": [
        {
          "input": "test input",
          "output": "expected output",
          "description": "what this test case verifies"
        }
      ]
    }`;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return JSON.parse(responseBody.completion);
  }

  async getAvailableTopics(weekNumber: number): Promise<Topic[]> {
    const weekMetadata = await this.getWeekMetadata(weekNumber);
    return weekMetadata.topics;
  }
} 