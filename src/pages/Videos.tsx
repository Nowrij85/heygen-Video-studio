import React, { useState, useEffect } from 'react';
import { 
  Video, 
  RefreshCw, 
  Download, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Filter,
  Search,
  ChevronRight,
  Play,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { useVideoPolling } from '../hooks/useVideoPolling';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const VideosPage = () => {
  const { apiKey, videos, updateVideo, removeVideo } = useAppStore();
  const { countdown, manualRefresh } = useVideoPolling();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await manualRefresh();
    setIsRefreshing(false);
  };

  const checkStatus = async (videoId: string) => {
    if (!apiKey) return;
    try {
      const client = getHeyGenClient(apiKey);
      const data = await client.getVideoStatus(videoId);
      updateVideo(videoId, {
        status: data.status,
        progress: data.progress,
        video_url: data.video_url,
        thumbnail_url: data.thumbnail_url,
        duration: data.duration,
        error: data.error
      });
    } catch (error) {
      console.error('Failed to check status', error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        if (apiKey) {
          const client = getHeyGenClient(apiKey);
          await client.deleteVideo(id);
        }
        removeVideo(id);
        toast.success('Video deleted');
      } catch (error) {
        toast.error('Removed from local list');
        removeVideo(id);
      }
    }
  };

  const downloadVideo = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredVideos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVideos.map(v => v.id));
    }
  };

  const batchDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.length} videos?`)) {
      for (const id of selectedIds) {
        removeVideo(id);
      }
      setSelectedIds([]);
      toast.success('Batch delete completed');
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Videos</h1>
          <p className="text-[#94a3b8] mt-1">Manage and download your generated content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1e1e2e] rounded-full text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border border-[#1e1e2e]">
            <RefreshCw size={12} className="animate-spin" />
            <span>Refreshing in {countdown}s</span>
          </div>
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-white px-4 py-2 rounded-xl font-bold border border-[#1e1e2e] transition-all disabled:opacity-50"
          >
            {isRefreshing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={20} />
          <input
            type="text"
            placeholder="Search videos by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'processing', 'completed', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-3 rounded-xl font-medium capitalize transition-all border whitespace-nowrap",
                filter === f 
                  ? "bg-[#6366f1] text-white border-[#6366f1]" 
                  : "bg-[#12121a] text-[#94a3b8] border-[#1e1e2e] hover:border-[#6366f1]/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#6366f1]">{selectedIds.length} selected</span>
            <button onClick={selectAll} className="text-xs text-[#94a3b8] hover:text-white underline">
              {selectedIds.length === filteredVideos.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={batchDelete}
              className="flex items-center gap-2 px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-xs font-bold hover:bg-[#ef4444]/20 transition-colors"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </motion.div>
      )}

      {/* Video List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVideos.map((video) => (
          <motion.div
            layout
            key={video.id}
            className={cn(
              "bg-[#12121a] border rounded-2xl overflow-hidden transition-all group",
              selectedIds.includes(video.id) ? "border-[#6366f1] bg-[#6366f1]/5" : "border-[#1e1e2e] hover:border-[#6366f1]/30"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center p-4 gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleSelect(video.id)}
                  className={cn(
                    "p-1 rounded transition-colors",
                    selectedIds.includes(video.id) ? "text-[#6366f1]" : "text-[#1e1e2e] hover:text-[#94a3b8]"
                  )}
                >
                  {selectedIds.includes(video.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div className="w-32 md:w-48 aspect-video bg-[#1e1e2e] rounded-xl overflow-hidden flex-shrink-0 relative">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                      {video.status === 'processing' ? <Loader2 className="animate-spin" size={32} /> : <Video size={32} />}
                    </div>
                  )}
                  {video.status === 'completed' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedVideo(video)}
                        className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform"
                      >
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white truncate text-lg">{video.title}</h3>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    video.status === 'completed' ? "bg-[#22c55e]/10 text-[#22c55e]" :
                    video.status === 'processing' ? "bg-[#f59e0b]/10 text-[#f59e0b] animate-pulse" :
                    video.status === 'failed' ? "bg-[#ef4444]/10 text-[#ef4444]" :
                    "bg-[#94a3b8]/10 text-[#94a3b8]"
                  )}>
                    {video.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{format(new Date(video.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                  {video.duration && (
                    <div className="flex items-center gap-2">
                      <Play size={14} />
                      <span>{video.duration}s</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>ID: {video.id.slice(0, 8)}...</span>
                  </div>
                </div>

                {video.status === 'processing' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                      <span>Rendering Progress</span>
                      <span>{video.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6366f1] transition-all duration-500" 
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {video.status === 'failed' && video.error && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#ef4444] bg-[#ef4444]/10 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>{video.error}</span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => checkStatus(video.id)}
                  className="flex-1 md:flex-none p-2.5 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-white rounded-xl transition-colors"
                  title="Check Status"
                >
                  <RefreshCw size={18} />
                </button>
                {video.status === 'completed' && video.video_url && (
                  <button
                    onClick={() => downloadVideo(video.video_url!, video.title)}
                    className="flex-1 md:flex-none p-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="flex-1 md:flex-none p-2.5 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredVideos.length === 0 && (
          <div className="text-center py-24 bg-[#12121a] border border-[#1e1e2e] rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e1e2e] rounded-full text-[#94a3b8] mb-4">
              <Video size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">No videos found</h3>
            <p className="text-[#94a3b8] mt-2">Start creating your first AI video</p>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl overflow-hidden w-full max-w-4xl"
            >
              <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between">
                <h3 className="font-bold text-white">{selectedVideo.title}</h3>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 text-[#94a3b8] hover:text-white"
                >
                  <AlertCircle size={24} className="rotate-45" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <video 
                  src={selectedVideo.video_url} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="text-sm text-[#94a3b8]">
                  <p>Duration: {selectedVideo.duration}s</p>
                  <p>Created: {format(new Date(selectedVideo.created_at), 'PPP p')}</p>
                </div>
                <button
                  onClick={() => downloadVideo(selectedVideo.video_url!, selectedVideo.title)}
                  className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 py-2 rounded-xl font-bold transition-all"
                >
                  <Download size={18} />
                  Download MP4
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
