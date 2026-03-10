import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === 'admin@sellerbd.com' && password === 'Ns@440185@Ns') {
      login('authenticated_admin_2024');
      toast.success('Welcome back, Admin!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#6366f1]/10 rounded-2xl flex items-center justify-center text-[#6366f1] mb-4">
              <Video size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">HeyGen Studio</h1>
            <p className="text-[#94a3b8] mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                placeholder="admin@sellerbd.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#94a3b8]">
              © 2024 HeyGen Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
