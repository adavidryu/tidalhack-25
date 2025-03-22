'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/content');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLoginClick = () => {
    setModalMode('login');
    setShowModal(true);
  };

  const handleSignUpClick = () => {
    setModalMode('signup');
    setShowModal(true);
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">LOGO</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSignUpClick}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                SIGN UP
              </button>
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 lg:py-32">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              An AI Intro to Programming Assistant
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Reinforce your in-class learning with formatted practice problems and an AI that understands you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                See features
              </button>
              <button
                onClick={handleSignUpClick}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Start learning
              </button>
            </div>
          </div>

          {/* Demo Section */}
          <div className="py-12">
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
              {/* Placeholder for video/demo content */}
              <div className="aspect-video bg-gray-200 w-full">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Demo Video/Content
                </div>
              </div>
              {/* Author tag */}
              <div className="p-4 flex justify-end">
                <div className="inline-flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  Adam Ryu
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  );
}
