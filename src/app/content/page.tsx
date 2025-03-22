'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function Content() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

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
              <h2 className="text-2xl font-bold">Practice Problem Sandbox</h2>
              <div className="flex-grow mt-6 bg-gray-100 rounded-xl p-8 overflow-auto">
                {/* Practice content goes here */}
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-3 mt-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Week Navigation */}
              <div className="mt-6 flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-lg font-medium">Week 1</span>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold">AI Assistant</h2>
              <div className="flex-grow mt-6">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 