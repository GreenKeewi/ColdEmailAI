'use client';

import { UserButton } from "@clerk/nextjs";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    tone: 'professional',
    dailyLimit: 50,
    followUpCadence: 3,
  });

  async function handleConnectGmail() {
    window.location.href = '/api/auth/gmail';
  }

  async function handleSkipGmail() {
    setStep(2);
  }

  async function handleSavePreferences() {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ColdEmail.AI
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-3 font-medium hidden sm:inline">Connect Email</span>
          </div>
          <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-3 font-medium hidden sm:inline">Preferences</span>
          </div>
        </div>

        {/* Step 1: Connect Email */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to ColdEmail.AI! 👋</h1>
            <p className="text-gray-600 mb-8">
              Let's get you set up. First, connect your email account to start sending personalized
              cold emails. We support Gmail via OAuth for maximum deliverability.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">🔒 Your Privacy Matters</h3>
              <p className="text-sm text-blue-800">
                Emails are sent from <strong>your account</strong> — we don't send without your
                explicit approval. Your Gmail tokens are encrypted and never shared.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleConnectGmail}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-4 hover:border-primary-600 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xl">
                  📧
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Connect Gmail</div>
                  <div className="text-sm text-gray-600">Recommended for best deliverability</div>
                </div>
                <span className="text-primary-600">→</span>
              </button>

              <div className="text-center text-gray-500 text-sm">or</div>

              <button
                onClick={handleSkipGmail}
                className="w-full text-gray-600 hover:text-gray-900 py-2"
              >
                Skip for now (use SendGrid fallback)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Set Your Preferences</h1>
            <p className="text-gray-600 mb-8">
              Customize your campaign settings. You can always change these later in Settings.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Email Tone
                </label>
                <select
                  value={preferences.tone}
                  onChange={(e) => setPreferences({ ...preferences, tone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  The AI will use this tone when generating emails
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Send Limit
                </label>
                <input
                  type="number"
                  value={preferences.dailyLimit}
                  onChange={(e) => setPreferences({ ...preferences, dailyLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum emails to send per day (prevents rate limiting)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Cadence (days)
                </label>
                <input
                  type="number"
                  value={preferences.followUpCadence}
                  onChange={(e) => setPreferences({ ...preferences, followUpCadence: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="14"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Days between follow-up emails in a sequence
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
              >
                Complete Setup →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
