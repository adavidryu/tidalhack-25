import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { WeekContent, PracticeProblem } from '@/types/problems';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

export async function getWeekContent(weekNumber: number): Promise<WeekContent> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `week-${weekNumber}/content.json`,
    });

    const response = await s3Client.send(command);
    const content = await response.Body?.transformToString();
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Error fetching week content:', error);
    throw error;
  }
}

export async function generateProblem(weekContent: WeekContent): Promise<PracticeProblem> {
  try {
    const prompt = `
      Generate a coding practice problem based on the following week's content:
      Week: ${weekContent.weekNumber}
      Topics: ${weekContent.topics.join(', ')}
      
      The problem should:
      1. Be relevant to the week's topics
      2. Include a clear description
      3. Have appropriate difficulty
      4. Include test cases
      5. Include hints
      
      Format the response as a JSON object matching the PracticeProblem interface.
    `;

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return JSON.parse(responseBody.completion);
  } catch (error) {
    console.error('Error generating problem:', error);
    throw error;
  }
} 