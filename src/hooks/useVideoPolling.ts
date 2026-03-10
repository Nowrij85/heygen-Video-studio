import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { toast } from 'sonner';

export const useVideoPolling = () => {
  const { apiKey, videos, updateVideo } = useAppStore();
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

      if (data.status === 'completed') {
        toast.success(`Video ready: ${videoId.slice(0, 8)}`);
      } else if (data.status === 'failed') {
        toast.error(`Video failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Polling error', error);
    }
  };

  const poll = async () => {
    const processing = videos.filter(v => v.status === 'processing' || v.status === 'pending');
    if (processing.length > 0) {
      await Promise.all(processing.map(v => checkStatus(v.id)));
    }
    setCountdown(30);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          poll();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videos, apiKey]);

  return { countdown, manualRefresh: poll };
};
