import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const SettingsPage = () => {
  const { apiKey, setApiKey, balance, setBalance, videos } = useAppStore();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setApiKey(inputKey);
    toast.success('API Key saved successfully');
    setIsSaving(false);
  };

  const testConnection = async () => {
    if (!inputKey) {
      toast.error('Please enter an API key first');
      return;
    }
    setIsTesting(true);
    try {
      const client = getHeyGenClient(inputKey);
      const data = await client.getBalance();
      setBalance(data);
      setApiKey(inputKey);
      toast.success('Connection successful! Balance updated.');
    } catch (error) {
      toast.error('Invalid API key or connection failed');
    } finally {
      setIsTesting(false);
    }
  };

  const maskedKey = apiKey ? `••••••••${apiKey.slice(-4)}` : 'Not configured';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-[#94a3b8] mt-1">Manage your HeyGen API configuration and account</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* API Key Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-[#1e1e2e] flex items-center gap-3">
            <div className="p-2 bg-[#6366f1]/10 rounded-lg text-[#6366f1]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-white">HeyGen API Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all pr-12"
                  placeholder="Enter your HeyGen API Key"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">
                Your API key is stored locally in your browser. Get it from your{' '}
                <a href="https://app.heygen.com/settings" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:underline">
                  HeyGen Settings
                </a>.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                <Save size={18} />
                Save API Key
              </button>
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-white px-6 py-2.5 rounded-xl font-bold border border-[#1e1e2e] transition-all disabled:opacity-50"
              >
                {isTesting ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Test Connection
              </button>
            </div>

            {apiKey && (
              <div className="flex items-center gap-2 p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl text-[#22c55e] text-sm">
                <CheckCircle2 size={16} />
                <span>Active Key: {maskedKey}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Balance Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-[#1e1e2e] flex items-center gap-3">
            <div className="p-2 bg-[#6366f1]/10 rounded-lg text-[#6366f1]">
              <Wallet size={20} />
            </div>
            <h3 className="font-bold text-white">Account Balance</h3>
          </div>
          <div className="p-6">
            {balance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#1e1e2e] rounded-xl">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">Remaining Credits</p>
                  <p className="text-3xl font-bold text-white mt-1">{balance.credits}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Type: {balance.type}</p>
                </div>
                <div className="p-4 bg-[#1e1e2e] rounded-xl">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">Usage Stats</p>
                  <p className="text-3xl font-bold text-white mt-1">{videos.length}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Total videos generated</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ef4444]">
                <AlertCircle size={20} />
                <p>API not configured. Please enter and save your API key to see balance.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
