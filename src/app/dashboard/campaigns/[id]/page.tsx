'use client';

import { UserButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '@/components/Toast';

interface Campaign {
  id: string;
  name: string;
  status: string;
  tone: string;
  totalLeads: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  status: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showAddLeadsModal, setShowAddLeadsModal] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) throw new Error('Failed to fetch campaign');
      const data = await res.json();
      setCampaign(data);
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      showToast('Failed to load campaign', 'error');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  async function handleGeneratePreview(lead: Lead) {
    setShowPreview(true);
    setPreview(null);
    
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          tone: campaign?.tone,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await res.json();
      setPreview(data);
    } catch (error) {
      console.error('Error generating preview:', error);
      showToast(error instanceof Error ? error.message : 'Failed to generate preview', 'error');
      setShowPreview(false);
    }
  }

  async function handleSendCampaign() {
    if (!confirm(`Send emails to ${leads.filter(l => l.status === 'pending').length} pending leads?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send campaign');
      }

      const data = await res.json();
      showToast(`Successfully sent ${data.sent} emails!`, 'success');
      if (data.failed > 0) {
        showToast(`${data.failed} emails failed to send`, 'warning');
      }
      fetchCampaign();
    } catch (error) {
      console.error('Error sending campaign:', error);
      showToast(error instanceof Error ? error.message : 'Failed to send campaign', 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteCampaign() {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete campaign');

      showToast('Campaign deleted successfully', 'success');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      showToast('Failed to delete campaign', 'error');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
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
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Campaign Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-900">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {campaign.status}
                  </span>
                  <span>Tone: {campaign.tone}</span>
                  <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddLeadsModal(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  + Add Leads
                </button>
                <button
                  onClick={handleSendCampaign}
                  disabled={sending || leads.filter(l => l.status === 'pending').length === 0}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Campaign'}
                </button>
                <button
                  onClick={handleDeleteCampaign}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{campaign.totalLeads}</div>
                <div className="text-sm text-gray-900">Total Leads</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{campaign.sentCount}</div>
                <div className="text-sm text-gray-900">Sent</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{campaign.openedCount}</div>
                <div className="text-sm text-gray-900">Opened</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{campaign.clickedCount}</div>
                <div className="text-sm text-gray-900">Clicked</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold">{campaign.repliedCount}</div>
                <div className="text-sm text-gray-900">Replied</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Leads</h2>
          </div>
          {leads.length === 0 ? (
            <div className="p-12 text-center text-gray-700">
              No leads in this campaign
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-gray-700">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lead.company || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {lead.title || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.status === 'replied' ? 'bg-green-100 text-green-800' :
                          lead.status === 'opened' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleGeneratePreview(lead)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Generate Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Leads Modal */}
      {showAddLeadsModal && (
        <AddLeadsModal
          campaignId={campaignId}
          onClose={() => setShowAddLeadsModal(false)}
          onSuccess={() => {
            setShowAddLeadsModal(false);
            fetchCampaign();
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Email Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-700 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {preview ? (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Subject Lines:</h3>
                  <div className="space-y-2">
                    {preview.subjects?.map((subject: string, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                        {subject}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Email Body:</h3>
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                    {preview.body}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Follow-ups:</h3>
                  {preview.followUps?.map((followUp: any, i: number) => (
                    <div key={i} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Follow-up {followUp.sequence}
                      </h4>
                      <div className="p-4 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
                        {followUp.body}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Send Test Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-700">
                Generating preview...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddLeadsModal({ 
  campaignId, 
  onClose, 
  onSuccess 
}: { 
  campaignId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!csvText.trim()) {
      setError('Please paste CSV data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse CSV (simple implementation)
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const emailIdx = headers.findIndex(h => h === 'email');
      
      if (emailIdx === -1) {
        throw new Error('CSV must have an "email" column');
      }

      const leads = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const firstNameIdx = headers.findIndex(h => h === 'firstname' || h === 'first_name');
        const lastNameIdx = headers.findIndex(h => h === 'lastname' || h === 'last_name');
        const companyIdx = headers.findIndex(h => h === 'company');
        const titleIdx = headers.findIndex(h => h === 'title');

        return {
          email: values[emailIdx],
          firstName: firstNameIdx >= 0 ? values[firstNameIdx] : '',
          lastName: lastNameIdx >= 0 ? values[lastNameIdx] : '',
          company: companyIdx >= 0 ? values[companyIdx] : '',
          title: titleIdx >= 0 ? values[titleIdx] : '',
        };
      }).filter(lead => lead.email); // Only include leads with email

      if (leads.length === 0) {
        throw new Error('No valid leads found in CSV');
      }

      const res = await fetch(`/api/campaigns/${campaignId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add leads');
      }

      const data = await res.json();
      showToast(`Successfully added ${data.count} leads!`, 'success');
      onSuccess();
    } catch (error) {
      console.error('Error adding leads:', error);
      const message = error instanceof Error ? error.message : 'Failed to add leads';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Paste your CSV data below. Required column: <strong>email</strong>. 
            Optional columns: <strong>firstname</strong>, <strong>lastname</strong>, <strong>company</strong>, <strong>title</strong>
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data
            </label>
            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setError('');
              }}
              className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="email,firstname,lastname,company,title&#10;john@example.com,John,Doe,Acme Inc,CEO&#10;jane@example.com,Jane,Smith,Tech Corp,CTO"
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
              onClick={handleUpload}
              disabled={!csvText.trim() || loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Leads'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
