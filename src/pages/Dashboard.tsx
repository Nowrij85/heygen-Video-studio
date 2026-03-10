import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Video, 
  Loader2, 
  CheckCircle, 
  PlusCircle, 
  Users, 
  Settings,
  RefreshCw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const DashboardPage = () => {
  const { apiKey, videos, balance, setBalance } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = [
    {
      title: 'API Balance',
      value: balance ? `${balance.credits}` : '0',
      subtitle: 'HeyGen Credits',
      icon: Wallet,
      color: 'text-[#6366f1]',
      bg: 'bg-[#6366f1]/10',
    },
    {
      title: 'Total Videos',
      value: `${videos.length}`,
      subtitle: 'All time generated',
      icon: Video,
      color: 'text-[#22c55e]',
      bg: 'bg-[#22c55e]/10',
    },
    {
      title: 'Processing',
      value: `${videos.filter(v => v.status === 'processing').length}`,
      subtitle: 'Currently rendering',
      icon: Loader2,
      color: 'text-[#f59e0b]',
      bg: 'bg-[#f59e0b]/10',
      animate: videos.filter(v => v.status === 'processing').length > 0,
    },
    {
      title: 'Completed',
      value: `${videos.filter(v => v.status === 'completed').length}`,
      subtitle: 'Ready to download',
      icon: CheckCircle,
      color: 'text-[#6366f1]',
      bg: 'bg-[#6366f1]/10',
    },
  ];

  const refreshBalance = async () => {
    if (!apiKey) {
      toast.error('API key not configured');
      return;
    }
    setIsRefreshing(true);
    try {
      const client = getHeyGenClient(apiKey);
      const data = await client.getBalance();
      setBalance(data);
      toast.success('Balance updated');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch balance';
      toast.error(`Sync failed: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (apiKey && !balance) {
      refreshBalance();
    }
  }, [apiKey]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-[#94a3b8] mt-1">Welcome back to HeyGen Studio</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
            apiKey ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20" : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
          )}>
            <div className={cn("w-2 h-2 rounded-full", apiKey ? "bg-[#22c55e]" : "bg-[#ef4444]")} />
            {apiKey ? 'API Connected' : 'API Not Configured'}
          </div>
          
          <button 
            onClick={refreshBalance}
            disabled={isRefreshing}
            className="p-2 bg-[#1e1e2e] text-[#94a3b8] hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#94a3b8]">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                <p className="text-xs text-[#94a3b8] mt-1">{stat.subtitle}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                <stat.icon size={24} className={stat.animate ? "animate-spin" : ""} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/dashboard/create?tab=agent"
          className="group bg-[#6366f1] p-6 rounded-2xl flex items-center justify-between hover:bg-[#4f46e5] transition-all shadow-lg shadow-[#6366f1]/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">Video Agent</h4>
              <p className="text-white/70 text-sm">Create from prompt</p>
            </div>
          </div>
          <ArrowRight className="text-white/50 group-hover:text-white transition-colors" />
        </Link>

        <Link 
          to="/dashboard/create?tab=avatar"
          className="group bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl flex items-center justify-between hover:border-[#6366f1]/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1]">
              <PlusCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">Avatar Video</h4>
              <p className="text-[#94a3b8] text-sm">Start from script</p>
            </div>
          </div>
          <ArrowRight className="text-[#94a3b8] group-hover:text-white transition-colors" />
        </Link>

        <Link 
          to="/dashboard/avatars"
          className="group bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl flex items-center justify-between hover:border-[#6366f1]/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1]">
              <Users size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">Browse Avatars</h4>
              <p className="text-[#94a3b8] text-sm">Explore library</p>
            </div>
          </div>
          <ArrowRight className="text-[#94a3b8] group-hover:text-white transition-colors" />
        </Link>

        <Link 
          to="/dashboard/settings"
          className="group bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl flex items-center justify-between hover:border-[#6366f1]/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1]">
              <Settings size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">Settings</h4>
              <p className="text-[#94a3b8] text-sm">Manage API</p>
            </div>
          </div>
          <ArrowRight className="text-[#94a3b8] group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Recent Videos */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between">
          <h3 className="font-bold text-white">Recent Videos</h3>
          <Link to="/dashboard/videos" className="text-sm text-[#6366f1] hover:underline">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1e1e2e]/50 text-[#94a3b8] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Video</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created At</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]">
              {videos.slice(0, 5).map((video) => (
                <tr key={video.id} className="hover:bg-[#1e1e2e]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-[#1e1e2e] rounded overflow-hidden flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                            <Video size={14} />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white truncate max-w-[150px]">{video.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      video.status === 'completed' ? "bg-[#22c55e]/10 text-[#22c55e]" :
                      video.status === 'processing' ? "bg-[#f59e0b]/10 text-[#f59e0b] animate-pulse" :
                      video.status === 'failed' ? "bg-[#ef4444]/10 text-[#ef4444]" :
                      "bg-[#94a3b8]/10 text-[#94a3b8]"
                    )}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94a3b8]">
                    {format(new Date(video.created_at), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/dashboard/videos" className="text-[#6366f1] hover:text-[#4f46e5]">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
                      <Video size={32} className="opacity-20" />
                      <p>No videos yet</p>
                      <Link to="/dashboard/create" className="text-[#6366f1] text-sm hover:underline">Create your first video</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
