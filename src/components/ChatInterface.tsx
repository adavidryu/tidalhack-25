'use client';

import { useState } from 'react';
import { PracticeProblem } from '@/types/problems';

interface ChatInterfaceProps {
  currentProblem: PracticeProblem | null;
  currentWeek: string | number;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  selectedTopics: string[];
}

export default function ChatInterface({
  currentProblem,
  currentWeek,
  selectedDifficulty,
  selectedTopics
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          problem: currentProblem,
          weekId: currentWeek,
          difficulty: selectedDifficulty,
          topics: selectedTopics
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {/* Format chat messages with code blocks */}
              {message.content.split('```').map((part, index) => {
                if (index % 2 === 1) {
                  // This is a code block
                  const [lang, ...code] = part.split('\n');
                  return (
                    <pre key={index} className="bg-gray-800 text-gray-100 rounded-lg p-3 my-2 font-mono text-sm overflow-x-auto max-h-[400px] overflow-y-auto">
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
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for help..."
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
