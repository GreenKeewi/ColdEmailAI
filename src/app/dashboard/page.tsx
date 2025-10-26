'use client';

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { showToast } from '@/components/Toast';

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalLeads: number;
  sentCount: number;
  openedCount: number;
  repliedCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (!res.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCampaign(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete campaign');
      }

      showToast('Campaign deleted successfully', 'success');
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      showToast('Failed to delete campaign', 'error');
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
                <Link href="/dashboard/campaigns" className="text-gray-700 hover:text-primary-600">
                  Campaigns
                </Link>
                <Link href="/settings" className="text-gray-700 hover:text-primary-600">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-900 mt-1">Manage your cold email campaigns</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            + Create Campaign
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Campaigns"
            value={campaigns.length}
            icon="📊"
          />
          <StatCard
            title="Emails Sent"
            value={campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
            icon="✉️"
          />
          <StatCard
            title="Opens"
            value={campaigns.reduce((sum, c) => sum + c.openedCount, 0)}
            icon="👁️"
          />
          <StatCard
            title="Replies"
            value={campaigns.reduce((sum, c) => sum + c.repliedCount, 0)}
            icon="💬"
          />
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-700">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-700 mb-4">No campaigns yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary-600 hover:underline"
              >
                Create your first campaign
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-900">
                          <span>{campaign.totalLeads} leads</span>
                          <span>•</span>
                          <span>{campaign.sentCount} sent</span>
                          <span>•</span>
                          <span>{campaign.openedCount} opened</span>
                          <span>•</span>
                          <span>{campaign.repliedCount} replied</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status}
                        </span>
                        <button
                          onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete campaign"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-900 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function CreateCampaignModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tone: 'professional', leads: [] }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      showToast('Campaign created successfully!', 'success');
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      const message = error instanceof Error ? error.message : 'Failed to create campaign';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Create New Campaign</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Q4 Outreach Campaign"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleCreate();
              }
            }}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
