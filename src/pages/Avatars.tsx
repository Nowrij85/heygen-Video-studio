import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Copy, 
  Video, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
  preview_video_url: string;
  gender: string;
  avatar_type: string;
}

export const AvatarsPage = () => {
  const { apiKey } = useAppStore();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const navigate = useNavigate();

  const fetchAvatars = async () => {
    if (!apiKey) {
      toast.error('API key not configured');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const client = getHeyGenClient(apiKey);
      const data = await client.getAvatars();
      setAvatars(data);
    } catch (error) {
      toast.error('Failed to fetch avatars');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, [apiKey]);

  const filteredAvatars = avatars.filter(a => {
    const matchesSearch = a.avatar_name.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || a.gender.toLowerCase() === genderFilter;
    return matchesSearch && matchesGender;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Avatar ID copied!');
  };

  const useAvatar = (id: string) => {
    navigate(`/dashboard/create?avatarId=${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Avatar Library</h1>
          <p className="text-[#94a3b8] mt-1">Choose the perfect face for your video</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#94a3b8] bg-[#12121a] px-4 py-2 rounded-full border border-[#1e1e2e]">
          <Users size={16} />
          <span>{filteredAvatars.length} Avatars available</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
          <input
            type="text"
            placeholder="Search avatars by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'male', 'female'].map((gender) => (
            <button
              key={gender}
              onClick={() => setGenderFilter(gender)}
              className={cn(
                "px-6 py-3 rounded-xl font-medium capitalize transition-all border",
                genderFilter === gender 
                  ? "bg-[#6366f1] text-white border-[#6366f1]" 
                  : "bg-[#12121a] text-[#94a3b8] border-[#1e1e2e] hover:border-[#6366f1]/50"
              )}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-[#6366f1]" size={48} />
          <p className="text-[#94a3b8]">Loading avatar library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAvatars.map((avatar, index) => (
            <motion.div
              key={avatar.avatar_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="group bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden hover:border-[#6366f1] transition-all"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src={avatar.preview_image_url} 
                  alt={avatar.avatar_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <button 
                    onClick={() => useAvatar(avatar.avatar_id)}
                    className="w-full bg-[#6366f1] text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    Use Avatar
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase">
                    {avatar.gender}
                  </span>
                  {avatar.avatar_type === 'custom' && (
                    <span className="px-2 py-1 bg-[#6366f1] rounded text-[10px] font-bold text-white uppercase">
                      Custom
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white truncate">{avatar.avatar_name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-[10px] text-[#94a3b8] bg-[#1e1e2e] px-2 py-1 rounded">
                    {avatar.avatar_id.slice(0, 8)}...
                  </code>
                  <button 
                    onClick={() => copyToClipboard(avatar.avatar_id)}
                    className="text-[#94a3b8] hover:text-white transition-colors"
                    title="Copy Avatar ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filteredAvatars.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e1e2e] rounded-full text-[#94a3b8] mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">No avatars found</h3>
          <p className="text-[#94a3b8] mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
