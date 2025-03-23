import { NextResponse } from 'next/server';
import { LectureService } from '@/services/lectureService';

const lectureService = new LectureService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { weekId, difficulty, problemType } = body;

    if (!weekId || !difficulty) {
      console.log('Missing required parameters:', { weekId, difficulty });
      return NextResponse.json(
        { error: 'Missing required parameters', received: { weekId, difficulty } },
        { status: 400 }
      );
    }

    console.log('Generating problem with:', { weekId, difficulty, problemType });
    
    // Generate problem using both S3 and Knowledge Base
    const problem = await lectureService.generateProblem(
      weekId,
      difficulty,
      problemType
    );

    console.log('Successfully generated problem:', problem);
    return NextResponse.json(problem);
  } catch (error: any) {
    console.error('Detailed error in problem generation:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate problem', 
        details: error?.message || 'Unknown error',
        type: error?.name || 'Unknown error type'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('week') || '1';

    console.log('Fetching topics for week:', weekId);
    const topics = await lectureService.getAvailableTopics(parseInt(weekId));
    return NextResponse.json(topics);
  } catch (error: any) {
    console.error('Error fetching topics:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch topics', 
        details: error?.message || 'Unknown error',
        type: error?.name || 'Unknown error type'
      },
      { status: 500 }
    );
  }
} 