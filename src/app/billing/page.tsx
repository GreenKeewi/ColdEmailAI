'use client';

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

interface BillingInfo {
  plan: string;
  status: string;
  nextBillingDate?: string;
  cancelAtPeriodEnd: boolean;
}

interface Usage {
  emailsGenerated: number;
  emailsSent: number;
  limit: number;
  remaining: number;
  resetDate: string;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [billingRes, usageRes] = await Promise.all([
        fetch('/api/billing'),
        fetch('/api/usage'),
      ]);

      if (!billingRes.ok || !usageRes.ok) {
        throw new Error('Failed to fetch billing data');
      }
      
      const billingData = await billingRes.json();
      const usageData = await usageRes.json();
      
      setBilling(billingData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      showToast('Failed to load billing information', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                ColdEmail.AI
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-gray-700 hover:text-primary-600">
                  Settings
                </Link>
                <Link href="/billing" className="text-primary-600 font-semibold">
                  Billing
                </Link>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Usage</h1>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Loading billing information...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Current Plan</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold capitalize mb-1">
                      {billing?.plan || 'Free'} Plan
                    </h3>
                    <p className="text-gray-600">
                      {billing?.plan === 'pro' ? '$12/month' : 'Free forever'}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    billing?.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {billing?.status || 'Active'}
                  </span>
                </div>

                {billing?.plan === 'pro' && billing?.nextBillingDate && (
                  <p className="text-sm text-gray-600 mb-4">
                    Next billing date: {new Date(billing.nextBillingDate).toLocaleDateString()}
                  </p>
                )}

                {billing?.plan === 'free' ? (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-primary-900 mb-2">
                      Upgrade to Pro
                    </h4>
                    <p className="text-sm text-primary-800 mb-4">
                      Get unlimited AI-generated emails, advanced analytics, and priority support
                      for just $12/month.
                    </p>
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-semibold">
                      Upgrade to Pro
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Update Payment Method
                    </button>
                    <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Usage This Month</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Emails Generated</span>
                      <span className="font-semibold">
                        {usage?.emailsGenerated || 0} / {usage?.limit || 25}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, ((usage?.emailsGenerated || 0) / (usage?.limit || 25)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {usage?.remaining || 0} remaining
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Emails Sent</span>
                      <span className="font-semibold">{usage?.emailsSent || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, ((usage?.emailsSent || 0) / (usage?.limit || 25)) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Usage resets on {usage?.resetDate ? new Date(usage.resetDate).toLocaleDateString() : 'the 1st of next month'}
                </p>

                {(usage?.remaining || 0) <= 5 && billing?.plan === 'free' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      ⚠️ Running Low on Credits
                    </h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      You only have {usage?.remaining} emails remaining this month.
                      Upgrade to Pro for unlimited emails.
                    </p>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold">
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Plan Comparison</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-2">Free</h3>
                    <p className="text-3xl font-bold mb-4">
                      $0<span className="text-lg text-gray-500">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        25 AI-generated emails/month
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Basic email tracking
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        CSV upload
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        Gmail & SendGrid integration
                      </li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className="border-2 border-primary-600 rounded-lg p-6 bg-primary-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Pro</h3>
                      <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold">
                        POPULAR
                      </span>
                    </div>
                    <p className="text-3xl font-bold mb-4">
                      $12<span className="text-lg text-gray-600">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="text-primary-600 mr-2">✓</span>
                        Unlimited AI emails (fair use)
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary-600 mr-2">✓</span>
                        Advanced analytics & tracking
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary-600 mr-2">✓</span>
                        Automated follow-up sequences
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary-600 mr-2">✓</span>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary-600 mr-2">✓</span>
                        Custom AI prompts
                      </li>
                    </ul>
                    {billing?.plan !== 'pro' && (
                      <button className="w-full mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-semibold">
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
