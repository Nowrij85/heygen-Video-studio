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
  const [isVerified, setIsVerified] = useState(!!apiKey);

  const handleSave = async () => {
    setIsSaving(true);
    setApiKey(inputKey);
    setIsVerified(true);
    toast.success('API Key saved successfully');
    setIsSaving(false);
  };

  const testConnection = async () => {
    if (!inputKey) {
      toast.error('Please enter an API key first');
      return;
    }
    setIsTesting(true);
    setIsVerified(false);
    try {
      const client = getHeyGenClient(inputKey);
      
      // First verify the key with a stable endpoint
      await client.testConnection();
      
      // If verification succeeds, save the key
      setApiKey(inputKey);
      setIsVerified(true);
      
      // Then try to get balance (this might still fail on some accounts, but key is verified)
      try {
        const balanceData = await client.getBalance();
        setBalance(balanceData);
        toast.success('Connection confirmed! API Key is valid and balance updated.');
      } catch (balanceError: any) {
        console.warn('Balance check failed after verification:', balanceError);
        toast.success('Connection confirmed! API Key is valid.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Connection failed';
      toast.error(`Verification failed: ${errorMessage}`);
      console.error('API Verification Error:', error);
      setIsVerified(false);
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
                {isTesting ? <RefreshCw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Verify API Key
              </button>
            </div>

            {apiKey && (
              <div className={`flex items-center justify-between p-3 border rounded-xl text-sm ${isVerified ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]'}`}>
                <div className="flex items-center gap-2">
                  {isVerified ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>Active Key: {maskedKey}</span>
                </div>
                {isVerified && (
                  <span className="bg-[#22c55e] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Confirmed
                  </span>
                )}
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

      {/* Troubleshooting Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6"
      >
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-[#f59e0b]" />
          Troubleshooting API Issues
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="font-bold text-[#94a3b8]">1. Verify your Key</p>
            <p className="text-[#64748b]">Ensure you've copied the full key from your HeyGen dashboard. It usually starts with a long string of random characters.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#94a3b8]">2. Account Status</p>
            <p className="text-[#64748b]">Check if your HeyGen account has active credits. Trial accounts may have limited API access depending on current HeyGen policies.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#94a3b8]">3. Browser Extensions</p>
            <p className="text-[#64748b]">Some ad-blockers or privacy extensions might block API requests. Try disabling them for this site if issues persist.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#94a3b8]">4. Need Help?</p>
            <p className="text-[#64748b]">If you see "Verification failed: Request failed with status code 401", your key is definitely invalid. Re-generate it in HeyGen settings.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
