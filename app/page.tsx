'use client'

import { useState, useEffect } from "react";
import { FaGlobe } from "react-icons/fa";
import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";
import CreateChannelModal from "./components/CreateChannelModal";
import JoinChannelModal from "./components/JoinChannelModal";

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  reactions: number;
  created_at: string;
  channel_id?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

const mockPosts: Post[] = [
  {
    id: 0,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "/post.jpg",
    author: "lorem",
    hasImage: true,
    reactions: 56,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 1,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "ipsum",
    hasImage: false,
    reactions: 20,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 2,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "ranoutof",
    hasImage: false,
    reactions: 20,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 3,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "placeholders",
    hasImage: false,
    reactions: 20,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'reactions' | 'date'>('reactions');
  const [dateFilter, setDateFilter] = useState<'24h' | '3d' | '7d'>('7d');
  const [viewMode, setViewMode] = useState<'global' | 'channel'>('global');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isJoiningChannel, setIsJoiningChannel] = useState(false);

  const fetchPosts = async () => {
    try {
      const endpoint = viewMode === 'global' 
        ? '/api/no-login/posts' 
        : selectedChannel 
          ? `/api/no-login/channels/${selectedChannel}/posts`
          : '/api/no-login/posts';
          
      const res = await fetch(endpoint, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Keep mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/no-login/channels', {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchChannels();
  }, [viewMode, selectedChannel]);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const createChannel = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/no-login/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      
      if (res.ok) {
        const newChannel = await res.json();
        setChannels(prev => [...prev, newChannel]);
        setSelectedChannel(newChannel.id);
        setViewMode('channel');
        setIsCreatingChannel(false);
        return true;
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    return false;
  };

  const joinChannel = async (channelId: string) => {
    try {
      const res = await fetch(`/api/no-login/channels/${channelId}/join`, {
        method: 'POST',
      });
      
      if (res.ok) {
        setSelectedChannel(channelId);
        setViewMode('channel');
        setIsJoiningChannel(false);
        fetchPosts();
        return true;
      }
    } catch (error) {
      console.error('Error joining channel:', error);
    }
    return false;
  };

  const getFilteredPosts = () => {
    const now = Date.now();
    const timeFilters = {
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    const filteredPosts = posts.filter(post => {
      const postTime = new Date(post.created_at).getTime();
      return now - postTime <= timeFilters[dateFilter];
    });

    return filteredPosts.sort((a, b) => {
      if (sortBy === 'reactions') {
        return b.reactions - a.reactions;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = Date.now();
    const postTime = new Date(dateString).getTime();
    const diffInMs = now - postTime;
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      if (diffInMinutes <= 1) return 'just now';
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  return (
    <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="sticky top-0 z-10 bg-[#FFF1CA] border-b border-[#FFB823]/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-black text-2xl font-semibold">Fridge</h1>
              <div className="w-px h-6 bg-black/20"></div>
              <FaGlobe className="text-black text-xl"></FaGlobe>
              <h1 className="text-black text-xl font-bold">
                {viewMode === 'global' ? 'Global' : selectedChannel ? channels.find(c => c.id === selectedChannel)?.name || 'Channel' : 'Channels'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-lg p-1 border border-[#FFB823]/30">
                <button
                  onClick={() => {
                    setViewMode('global');
                    setSelectedChannel(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'global' 
                      ? 'bg-[#FFB823] text-black' 
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Global
                </button>
                <button
                  onClick={() => setViewMode('channel')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'channel' 
                      ? 'bg-[#FFB823] text-black' 
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Channels
                </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
              >
                New Post
              </button>
            </div>
          </div>

          {viewMode === 'channel' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedChannel ? (
                  <div className="flex items-center space-x-3"> 
                    <span className="text-black text-sm font-medium">
                      Current: {channels.find(c => c.id === selectedChannel)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedChannel(null)}
                      className="text-[#FFB823] hover:text-[#ffad00] text-sm font-medium"
                    >
                      Leave Channel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsCreatingChannel(true)}
                      className="bg-[#FFB823] px-4 py-2 text-black rounded-lg hover:bg-[#ffad00] transition-colors font-medium text-sm"
                    >
                      Create Channel
                    </button>
                    <button
                      onClick={() => setIsJoiningChannel(true)}
                      className="bg-white border border-[#FFB823]/30 px-4 py-2 text-black rounded-lg hover:bg-[#FFB823]/10 transition-colors font-medium text-sm"
                    >
                      Join Channel
                    </button>
                  </div>
                )}
              </div>
              
              {selectedChannel && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-black text-sm font-medium">Sort by:</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'reactions' | 'date')}
                      className="bg-white border border-[#FFB823]/30 rounded-lg px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
                      title="Sort posts by"
                    >
                      <option value="reactions">Reactions</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-black text-sm font-medium">Time:</label>
                    <select 
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as '24h' | '3d' | '7d')}
                      className="bg-white border border-[#FFB823]/30 rounded-lg px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
                      title="Filter posts by time"
                    >
                      <option value="24h">Last 24h</option>
                      <option value="3d">Last 3 days</option>
                      <option value="7d">Last 7 days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'global' && (
            <div className="flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-black text-sm font-medium">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'reactions' | 'date')}
                  className="bg-white border border-[#FFB823]/30 rounded-lg px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
                  title="Sort posts by"
                >
                  <option value="reactions">Reactions</option>
                  <option value="date">Date</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-black text-sm font-medium">Time:</label>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as '24h' | '3d' | '7d')}
                  className="bg-white border border-[#FFB823]/30 rounded-lg px-3 py-1 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB823]"
                  title="Filter posts by time"
                >
                  <option value="24h">Last 24h</option>
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-black text-lg">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredPosts().map((post) => (
              <PostCard key={post.id} post={post} getRelativeTime={getRelativeTime} />
            ))}
          </div>
        )}
      </main>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
        selectedChannel={viewMode === 'channel' ? selectedChannel : null}
      />
      
      <CreateChannelModal
        isOpen={isCreatingChannel}
        onClose={() => setIsCreatingChannel(false)}
        onChannelCreated={createChannel}
      />
      
      <JoinChannelModal
        isOpen={isJoiningChannel}
        onClose={() => setIsJoiningChannel(false)}
        channels={channels}
        onChannelJoined={joinChannel}
      />
    </div>
  );
}