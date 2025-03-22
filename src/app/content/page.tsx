'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import AIBackground from '@/components/AIBackground';
import { PracticeProblem } from '@/types/problems';

export default function Content() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>({
    id: 'placeholder',
    title: 'Welcome to Programming Practice',
    description: 'This is a placeholder problem while the AI integration is being set up. The actual problems will be generated based on your course materials.',
    difficulty: 'medium',
    category: 'introduction',
    weekNumber: 1,
    hints: [
      'This is a placeholder hint',
      'The real system will provide contextual hints based on the course material'
    ],
    testCases: [
      {
        input: 'Example input',
        output: 'Example output'
      }
    ]
  });
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

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

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(prev => prev - 1);
    }
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const handleGenerateNewProblem = async () => {
    // Commented out until S3/Knowledge Base is set up
    /*
    setIsLoadingProblem(true);
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
      console.error('Error generating new problem:', error);
    } finally {
      setIsLoadingProblem(false);
    }
    */
    // For now, just show a message
    alert('Problem generation will be available once the AI integration is set up.');
  };

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
      <nav className="fixed w-full top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">LOGO</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => logout()}
                className="text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
              <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium">
                {user?.name?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel - Coding Practice */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Practice Problem Sandbox</h2>
                <div className="flex gap-4">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="rounded-lg border-gray-300 text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <button
                    onClick={handleGenerateNewProblem}
                    disabled={isLoadingProblem}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Generate New Problem
                  </button>
                </div>
              </div>
              <div className="flex-grow bg-gray-100 rounded-xl p-8 overflow-auto">
                {isLoadingProblem ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : currentProblem ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{currentProblem.title}</h3>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {currentProblem.difficulty}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p>{currentProblem.description}</p>
                    </div>
                    {currentProblem.hints.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Hints:</h4>
                        <ul className="list-disc list-inside space-y-2">
                          {currentProblem.hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentProblem.testCases && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Test Cases:</h4>
                        <div className="space-y-2">
                          {currentProblem.testCases.map((testCase, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg">
                              <div>Input: <code>{testCase.input}</code></div>
                              <div>Expected Output: <code>{testCase.output}</code></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No problem loaded. Click "Generate New Problem" to start.
                  </div>
                )}
              </div>
              
              {/* Week Navigation */}
              <div className="mt-6 flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={handlePreviousWeek}
                  disabled={currentWeek === 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-medium">Week {currentWeek}</span>
                <button 
                  onClick={handleNextWeek}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="lg:col-span-1 flex flex-col relative rounded-2xl shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
            <div className="relative z-10 p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Assistant</h2>
              <div className="flex-grow">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 