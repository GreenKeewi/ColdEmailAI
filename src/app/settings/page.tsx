'use client';

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Settings {
  gmailConnected: boolean;
  gmailEmail: string | null;
  sendgridEnabled: boolean;
  aiProvider: string;
  defaultTone: string;
  dailySendLimit: number;
  followUpCadence: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectGmail() {
    window.location.href = '/api/auth/gmail';
  }

  async function handleDisconnectGmail() {
    if (!confirm('Are you sure you want to disconnect Gmail?')) return;
    
    try {
      await fetch('/api/auth/gmail/disconnect', { method: 'POST' });
      fetchSettings();
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
    }
  }

  async function handleSave() {
    if (!settings) return;
    
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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
                <Link href="/settings" className="text-primary-600 font-semibold">
                  Settings
                </Link>
                <Link href="/billing" className="text-gray-700 hover:text-primary-600">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Loading settings...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email Connections */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Email Connections</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your email account to send from your address
                </p>
              </div>
              <div className="p-6 space-y-4">
                {/* Gmail */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                      📧
                    </div>
                    <div>
                      <h3 className="font-semibold">Gmail</h3>
                      {settings?.gmailConnected ? (
                        <p className="text-sm text-green-600">
                          Connected: {settings.gmailEmail}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  {settings?.gmailConnected ? (
                    <button
                      onClick={handleDisconnectGmail}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Connect Gmail
                    </button>
                  )}
                </div>

                {/* SendGrid */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-semibold">SendGrid (Fallback)</h3>
                      <p className="text-sm text-gray-500">
                        Configured via environment variables
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">AI Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Tone
                  </label>
                  <select
                    value={settings?.defaultTone}
                    onChange={(e) => setSettings({ ...settings!, defaultTone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Campaign Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Send Limit
                  </label>
                  <input
                    type="number"
                    value={settings?.dailySendLimit}
                    onChange={(e) => setSettings({ ...settings!, dailySendLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum emails to send per day across all campaigns
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Cadence (days)
                  </label>
                  <input
                    type="number"
                    value={settings?.followUpCadence}
                    onChange={(e) => setSettings({ ...settings!, followUpCadence: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="14"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Days between follow-up emails
                  </p>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Data & Privacy</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-semibold text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
