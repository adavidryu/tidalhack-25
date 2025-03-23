import { NextResponse } from 'next/server';
import { LectureService } from '@/services/lectureService';

const lectureService = new LectureService();

export async function POST(request: Request) {
  try {
    const { weekNumber, difficulty, topics } = await request.json();

    if (!weekNumber || !difficulty || !topics) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const problem = await lectureService.generateProblem(
      weekNumber,
      difficulty,
      topics
    );

    return NextResponse.json(problem);
  } catch (error: any) {
    console.error('Error generating problem:', error);
    return NextResponse.json(
      { error: 'Failed to generate problem', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekNumber = parseInt(searchParams.get('week') || '1');

    const topics = await lectureService.getAvailableTopics(weekNumber);
    return NextResponse.json(topics);
  } catch (error: any) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 