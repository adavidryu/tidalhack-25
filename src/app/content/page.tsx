'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { PracticeProblem, Problem } from '@/types/problems';
import Image from 'next/image';

interface ContentChunk {
  text: string;
  metadata: {
    weekNumber: number;
    topics: string[];
    concepts: string[];
    difficulty: string;
  }
}

class LectureService {
  private knowledgeBaseId: string;

  constructor() {
    this.knowledgeBaseId = process.env.AWS_KNOWLEDGE_BASE_ID || '';
  }

  async generateProblem(
    weekId: number | string,
    difficulty: 'easy' | 'medium' | 'hard',
    problemType: 'MCQ' | 'FRQ'
  ): Promise<Problem> {
    // For now, return a placeholder problem
    return {
      id: 'placeholder',
      title: `Practice Problem - ${difficulty}`,
      description: 'This is a placeholder problem. The actual problem generation will be implemented with AWS Bedrock.',
      difficulty,
      category: typeof weekId === 'string' ? 'exam' : 'week',
      weekNumber: typeof weekId === 'string' ? parseInt(weekId.replace('exam', '')) : weekId,
      hints: ['This is a placeholder hint'],
      testCases: [],
      correctAnswer: 'Placeholder answer',
      explanation: 'This is a placeholder explanation'
    };
  }
}

export default function Content() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState<number | string>(1);
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>({
    id: 'placeholder',
    title: 'Welcome to Programmy',
    description: 'Your AI-powered programming practice companion for CSCE 120. Select a week or exam, choose your preferred difficulty and problem type, then click "Generate New Problem" to start practicing.',
    difficulty: 'medium',
    category: 'introduction',
    weekNumber: 1,
    hints: [
      'Start with easier problems to build confidence',
      'Use the AI Assistant for help when stuck',
      'Try both formats for comprehensive practice'
    ],
    testCases: []
  });
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problemType, setProblemType] = useState<'MCQ' | 'FRQ'>('FRQ');
  const [isGenerating, setIsGenerating] = useState(false);
  const [answer, setAnswer] = useState(''); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const RATE_LIMIT_DELAY = 3000; // 3 seconds between requests

  const weeks = [
    { id: 1, label: 'Week 1' },
    { id: 2, label: 'Week 2' },
    { id: 3, label: 'Week 3' },
    { id: 4, label: 'Week 4' },
    { id: 5, label: 'Week 5' },
    { id: 'exam1', label: 'Exam 1' },
    { id: 6, label: 'Week 6' },
    { id: 7, label: 'Week 7' },
    { id: 8, label: 'Week 8' },
    { id: 10, label: 'Week 10' },
    { id: 11, label: 'Week 11' },
    { id: 'exam2', label: 'Exam 2' },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Commented out until S3/Knowledge Base is set up
  /*
  useEffect(() => {
    async function fetchProblem() {
      try {
        const response = await fetch(
          `/api/problems?week=${currentWeek}&difficulty=${selectedDifficulty}${
            selectedTopics.length ? `&topics=${selectedTopics.join(',')}` : ''
          }`
        );
        const data = await response.json();
        if (data.problem) {
          setCurrentProblem(data.problem);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    }

    if (isAuthenticated) {
      fetchProblem();
    }
  }, [currentWeek, selectedDifficulty, selectedTopics, isAuthenticated]);
  */

  const getCurrentWeekLabel = () => {
    const week = weeks.find(w => w.id === currentWeek);
    return week ? week.label : `Week ${currentWeek}`;
  };

  const placeholderProblem: PracticeProblem = {
    id: 'placeholder',
    title: `Welcome to ${getCurrentWeekLabel()}`,
    description: `Ready to practice ${getCurrentWeekLabel()} content? Select your preferred difficulty and problem type, then click "Generate New Problem" to start.`,
    difficulty: 'medium' as const,
    category: typeof currentWeek === 'string' ? 'exam' : 'week',
    weekNumber: typeof currentWeek === 'string' ? parseInt(currentWeek.replace('exam', '')) : currentWeek,
    hints: [
      'Choose a difficulty level that matches your comfort',
      'Try both MCQ and FRQ formats for comprehensive practice',
      'Use the AI Assistant for help when stuck'
    ],
    testCases: []
  };

  const handlePreviousWeek = () => {
    const currentIndex = weeks.findIndex(w => w.id === currentWeek);
    if (currentIndex > 0) {
      const newWeek = weeks[currentIndex - 1].id;
      setCurrentWeek(newWeek);
      setCurrentProblem({
        id: 'placeholder',
        title: `Welcome to ${weeks[currentIndex - 1].label}`,
        description: `Ready to practice ${weeks[currentIndex - 1].label} content? Select your preferred difficulty and problem type, then click "Generate New Problem" to start.`,
        difficulty: 'medium' as const,
        category: typeof newWeek === 'string' ? 'exam' : 'week',
        weekNumber: typeof newWeek === 'string' ? parseInt(newWeek.replace('exam', '')) : newWeek,
        hints: [
          'Choose a difficulty level that matches your comfort',
          'Try both MCQ and FRQ formats for comprehensive practice',
          'Use the AI Assistant for help when stuck'
        ],
        testCases: []
      });
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex(w => w.id === currentWeek);
    if (currentIndex < weeks.length - 1) {
      const newWeek = weeks[currentIndex + 1].id;
      setCurrentWeek(newWeek);
      setCurrentProblem({
        id: 'placeholder',
        title: `Welcome to ${weeks[currentIndex + 1].label}`,
        description: `Ready to practice ${weeks[currentIndex + 1].label} content? Select your preferred difficulty and problem type, then click "Generate New Problem" to start.`,
        difficulty: 'medium' as const,
        category: typeof newWeek === 'string' ? 'exam' : 'week',
        weekNumber: typeof newWeek === 'string' ? parseInt(newWeek.replace('exam', '')) : newWeek,
        hints: [
          'Choose a difficulty level that matches your comfort',
          'Try both MCQ and FRQ formats for comprehensive practice',
          'Use the AI Assistant for help when stuck'
        ],
        testCases: []
      });
    }
  };

  const handleGenerateNewProblem = async () => {
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), RATE_LIMIT_DELAY - (now - lastRequestTime));
      return;
    }

    setIsGenerating(true);
    setLastRequestTime(now);
    try {
      console.log('Sending request with:', { 
        weekId: currentWeek, 
        difficulty: selectedDifficulty,
        problemType 
      });
      
      const response = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekId: currentWeek,
          difficulty: selectedDifficulty,
          problemType
        }),
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate problem');
      }

      setCurrentProblem(data);
    } catch (error: any) {
      console.error('Error generating problem:', error);
      alert(error.message || 'Failed to generate problem');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: currentProblem,
          answer: answer.trim(),
          weekId: currentWeek,
          difficulty: selectedDifficulty
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify answer');
      }

      setVerificationStatus(data.isCorrect ? 'correct' : 'incorrect');
      
      // Reset verification status after 2 seconds
      setTimeout(() => {
        setVerificationStatus(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying answer:', error);
      alert('Failed to verify answer. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Reset answer and verification status when generating new problem
  useEffect(() => {
    setAnswer('');
    setVerificationStatus(null);
  }, [currentProblem]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/icon.png"
                alt="Programmy Logo"
                width={144}
                height={144}
                className="mr-4"
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={logout}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Sign Out
              </button>
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                {user?.name?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full flex gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Coding Practice */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Practice Problem Sandbox
                </h2>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${problemType === 'FRQ' ? 'text-purple-600' : 'text-gray-500'}`}>Writing</span>
                    <button
                      onClick={() => {
                        setProblemType(problemType === 'MCQ' ? 'FRQ' : 'MCQ');
                        setAnswer('');
                        setVerificationStatus(null);
                        setCurrentProblem({
                          id: 'placeholder',
                          title: `Welcome to ${getCurrentWeekLabel()}`,
                          description: `Ready to practice ${getCurrentWeekLabel()} content? Select your preferred difficulty and problem type (${problemType === 'MCQ' ? 'Writing' : 'Tracing'}), then click "Generate New Problem" to start.`,
                          difficulty: 'medium',
                          category: typeof currentWeek === 'string' ? 'exam' : 'week',
                          weekNumber: typeof currentWeek === 'string' ? parseInt(currentWeek.replace('exam', '')) : currentWeek,
                          hints: [
                            'Choose a difficulty level that matches your comfort',
                            'Try both Writing and Tracing formats for comprehensive practice',
                            'Use the AI Assistant for help when stuck'
                          ],
                          testCases: []
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        problemType === 'MCQ' ? 'bg-gradient-to-r from-purple-600 to-[#3ff9ed]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          problemType === 'MCQ' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${problemType === 'MCQ' ? 'text-purple-600' : 'text-gray-500'}`}>Tracing</span>
                  </div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="rounded-lg border-gray-300 text-sm px-4 py-2 bg-white border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  >
                    <option value="easy" className="text-green-600">Easy</option>
                    <option value="medium" className="text-yellow-600">Medium</option>
                    <option value="hard" className="text-red-600">Hard</option>
                  </select>
                  <button
                    onClick={handleGenerateNewProblem}
                    disabled={isGenerating || isRateLimited}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-[#3ff9ed] text-white rounded-lg hover:shadow-lg hover:shadow-purple-200 disabled:opacity-50 transition-all duration-200"
                  >
                    {isRateLimited ? 'Please wait...' : isGenerating ? 'Generating...' : 'Generate New Problem'}
                  </button>
                </div>
              </div>

              {/* Problem Content Box - Fixed Height */}
              <div className="h-[calc(100vh-20rem)] bg-gray-50 rounded-xl p-6 flex flex-col">
                {isGenerating ? (
                  <div className="flex items-center justify-center flex-grow">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : currentProblem ? (
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
                    </div>
                    <div className="prose max-w-none flex-grow overflow-y-auto">
                      {/* Format problem description with code blocks */}
                      {currentProblem.description.split('```').map((part, index) => {
                        if (index % 2 === 1) {
                          // This is a code block
                          const [lang, ...code] = part.split('\n');
                          return (
                            <pre key={index} className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-[400px] overflow-y-auto">
                              {lang && <div className="text-xs text-gray-400 mb-1">{lang}</div>}
                              <code className="block whitespace-pre">{code.join('\n').trim()}</code>
                            </pre>
                          );
                        }
                        // Regular text with line breaks
                        return part.split('\n').map((line, i) => (
                          <p key={`${index}-${i}`} className="whitespace-pre-wrap mb-2">
                            {line}
                          </p>
                        ));
                      })}
                    </div>
                    {currentProblem.hints.length > 0 && (
                      <div className="mt-auto pt-4">
                        <h4 className="font-semibold mb-1">Hints:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {currentProblem.hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentProblem.testCases && currentProblem.testCases.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-1">Test Cases:</h4>
                        <div className="space-y-1">
                          {currentProblem.testCases.map((testCase, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg">
                              <div>Input: <code>{testCase.input}</code></div>
                              <div>Expected Output: <code>{testCase.output}</code></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-grow text-center text-gray-500">
                    No problem loaded. Click "Generate New Problem" to start.
                  </div>
                )}
              </div>

              {/* Answer Verification Section - Only show for MCQ/Tracing mode */}
              {problemType === 'MCQ' && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                      placeholder="Enter your answer..."
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      disabled={isVerifying}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {verificationStatus === 'correct' && (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {verificationStatus === 'incorrect' && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmitAnswer}
                    disabled={isVerifying || !answer.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-[#3ff9ed] text-white rounded-lg hover:shadow-lg hover:shadow-purple-200 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all duration-200"
                  >
                    {isVerifying ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              )}
              
              {/* Week Navigation */}
              <div className="mt-4 flex justify-center items-center gap-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={handlePreviousWeek}
                  disabled={weeks.findIndex(w => w.id === currentWeek) === 0}
                  className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-[#3ff9ed]/10 hover:from-purple-200 hover:to-[#3ff9ed]/20 disabled:opacity-50 disabled:hover:from-purple-100 disabled:hover:to-[#3ff9ed]/10 transition-all duration-200"
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-medium px-4 py-2 bg-gradient-to-r from-purple-100 to-[#3ff9ed]/10 text-purple-800 rounded-full">
                  {getCurrentWeekLabel()}
                </span>
                <button 
                  onClick={handleNextWeek}
                  disabled={weeks.findIndex(w => w.id === currentWeek) === weeks.length - 1}
                  className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-[#3ff9ed]/10 hover:from-purple-200 hover:to-[#3ff9ed]/20 disabled:opacity-50 disabled:hover:from-purple-100 disabled:hover:to-[#3ff9ed]/10 transition-all duration-200"
                >
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="w-[400px] flex flex-col relative rounded-2xl shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
            <div className="relative z-10 p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                AI Assistant
              </h2>
              <div className="flex-grow">
                <ChatInterface 
                  currentProblem={currentProblem}
                  currentWeek={currentWeek}
                  selectedDifficulty={selectedDifficulty}
                  selectedTopics={[]}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 