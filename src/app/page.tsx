'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';

export default function LandingPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/content');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                onClick={login}
                className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={login}
                className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-all duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-[#3ff9ed] bg-clip-text text-transparent">
                Master Programming
              </span>
              <br />
              with AI-Powered Practice
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your personalized programming companion for CSCE 120. Practice with AI-generated problems, get instant feedback, and improve your skills.
            </p>
            <button
              onClick={login}
              className="px-8 py-3 bg-purple-600 text-white rounded-full font-medium text-lg hover:bg-purple-700 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Problems</h3>
              <p className="text-gray-600">Practice with dynamically generated problems tailored to your skill level and week content.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600">Get instant help and explanations from our AI assistant when you're stuck.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-600">Practice with both MCQ and FRQ formats to prepare for exams and assignments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white/80">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>© 2025 Programmy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
