import { NextResponse } from 'next/server';

const systemMessages = {
  default: {
    role: 'system',
    content: 'You are a TAMU CSCE 120 tutor. Help students with C++ programming questions.'
  },
  tutor: {
    role: 'system',
    content: `You are a personalized, expert C++ programming tutor named Programmy, dedicated to helping students in Texas A&M University's CSCE 120 course: Introduction to Programming in C++.`
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';

  return NextResponse.json(systemMessages[type as keyof typeof systemMessages] || systemMessages.default);
} 