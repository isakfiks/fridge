import { useState, useEffect } from 'react';

const JOINED_CHANNELS_KEY = 'fridge_joined_channels';

export function useJoinedChannels() {
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(JOINED_CHANNELS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setJoinedChannels(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing joined channels:', error);
        setJoinedChannels([]);
      }
    }
  }, []);

  const joinChannel = (channelId: string) => {
    setJoinedChannels(prev => {
      if (prev.includes(channelId)) return prev;
      const updated = [...prev, channelId];
      localStorage.setItem(JOINED_CHANNELS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const leaveChannel = (channelId: string) => {
    setJoinedChannels(prev => {
      const updated = prev.filter(id => id !== channelId);
      localStorage.setItem(JOINED_CHANNELS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isJoined = (channelId: string) => {
    return joinedChannels.includes(channelId);
  };

  return {
    joinedChannels,
    joinChannel,
    leaveChannel,
    isJoined,
  };
}