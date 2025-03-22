import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { KnowledgeBaseQuery, PracticeProblem } from '@/types/problems';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

export async function generateProblem(query: KnowledgeBaseQuery): Promise<PracticeProblem> {
  try {
    const prompt = `
      Generate a coding practice problem based on the following context:
      Week: ${query.weekNumber}
      ${query.topics ? `Topics: ${query.topics.join(', ')}` : ''}
      ${query.difficulty ? `Difficulty: ${query.difficulty}` : ''}
      
      The problem should:
      1. Be relevant to the week's content
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