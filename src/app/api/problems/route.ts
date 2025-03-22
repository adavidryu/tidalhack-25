import { NextResponse } from 'next/server';
import { generateProblem } from '@/services/knowledgeBaseService';
import { KnowledgeBaseQuery } from '@/types/problems';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekNumber = parseInt(searchParams.get('week') || '1');
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | undefined;
    const topics = searchParams.get('topics')?.split(',');

    const query: KnowledgeBaseQuery = {
      weekNumber,
      difficulty,
      topics,
    };

    const problem = await generateProblem(query);

    return NextResponse.json({ problem });
  } catch (error) {
    console.error('Error in problems API:', error);
    return NextResponse.json(
      { error: 'Failed to generate problem' },
      { status: 500 }
    );
  }
} 