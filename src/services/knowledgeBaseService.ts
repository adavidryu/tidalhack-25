import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { KnowledgeBaseQuery, PracticeProblem } from '@/types/problems';
import { MODEL_ID } from '@/config/aws';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-west-2',
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
      Content: ${query.text}
      ${query.metadata ? `
      Type: ${query.metadata.contentType}
      Number: ${query.metadata.contentNumber}
      Difficulty: ${query.metadata.difficulty}
      Problem Type: ${query.metadata.problemType}
      ` : ''}
      
      The problem should:
      1. Be relevant to the content
      2. Include a clear description
      3. Have appropriate difficulty
      4. Include test cases
      5. Include hints
      
      IMPORTANT: Your response must be a valid JSON object that matches this interface:
      {
        "id": string,
        "title": string,
        "description": string,
        "difficulty": "easy" | "medium" | "hard",
        "category": "week" | "exam" | "introduction",
        "weekNumber": number,
        "hints": string[],
        "testCases": { "input": string, "output": string }[]
      }
      
      Do not include any text before or after the JSON object. Only return the JSON object.
    `;

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract the JSON from the completion text
    const completionText = responseBody.completion.trim();
    const jsonMatch = completionText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const problem = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    const requiredFields = ['id', 'title', 'description', 'difficulty', 'category', 'weekNumber', 'hints', 'testCases'];
    for (const field of requiredFields) {
      if (!(field in problem)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return problem;
  } catch (error) {
    console.error('Error generating problem:', error);
    // Return a fallback problem if generation fails
    return {
      id: 'fallback-' + Date.now(),
      title: 'Example Problem',
      description: 'This is a fallback problem. Please try generating a new problem.',
      difficulty: 'medium',
      category: 'week',
      weekNumber: 1,
      hints: ['This is a fallback hint'],
      testCases: [
        { input: 'example input', output: 'example output' }
      ]
    };
  }
} 