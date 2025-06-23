'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaUsers, FaUserPlus, FaUserMinus, FaCheckCircle } from "react-icons/fa";
import PostCard from "../../components/PostCard";
import CreatePostModal from "../../components/CreatePostModal";
import { useJoinedChannels } from "../../hooks/useJoinedChannels";

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  hasPoll: boolean;
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
  verified: boolean;
}

const PostSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const ChannelHeaderSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-28"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="flex items-center justify-end space-x-4">
      <div className="h-8 bg-gray-200 rounded w-32"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

const LoadMoreSkeleton = () => (
  <div className="flex justify-center mt-8">
    <div className="bg-gray-200 px-8 py-3 rounded-xl animate-pulse h-12 w-64"></div>
  </div>
);

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'reactions' | 'date'>('reactions');
  const [dateFilter, setDateFilter] = useState<'24h' | '3d' | '7d'>('7d');
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { joinChannel: addToJoined, leaveChannel: removeFromJoined, isJoined } = useJoinedChannels();

  const fetchChannel = async () => {
    try {
      const res = await fetch('/api/no-login/channels', {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const channels = await res.json();
        const currentChannel = channels.find((c: Channel) => c.id === channelId);
        if (currentChannel) {
          setChannel(currentChannel);
        } else {
          // Channel not found, redirect to home
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
      router.push('/');
    }
  };

  const fetchPosts = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    }
    
    try {
      const res = await fetch(`/api/no-login/channels/${channelId}/posts`, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchChannel();
      fetchPosts();
    }
  }, [channelId]);  const handleJoinChannel = async () => {
    // Optimistic update - immediately update local state
    setChannel(prev => prev ? { ...prev, member_count: prev.member_count + 1 } : prev);
    addToJoined(channelId);

    try {
      const res = await fetch(`/api/no-login/channels/${channelId}/join`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        // Revert optimistic update on failure
        setChannel(prev => prev ? { ...prev, member_count: prev.member_count - 1 } : prev);
        removeFromJoined(channelId);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      // Revert optimistic update on error
      setChannel(prev => prev ? { ...prev, member_count: prev.member_count - 1 } : prev);
      removeFromJoined(channelId);
    }
  };  const handleLeaveChannel = async () => {
    // Optimistic update - immediately update local state
    setChannel(prev => prev ? { ...prev, member_count: Math.max(prev.member_count - 1, 0) } : prev);
    removeFromJoined(channelId);

    try {
      const res = await fetch(`/api/no-login/channels/${channelId}/leave`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        // Revert optimistic update on failure
        setChannel(prev => prev ? { ...prev, member_count: prev.member_count + 1 } : prev);
        addToJoined(channelId);
      }
    } catch (error) {
      console.error('Error leaving channel:', error);
      // Revert optimistic update on error
      setChannel(prev => prev ? { ...prev, member_count: prev.member_count + 1 } : prev);
      addToJoined(channelId);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
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

  if (!channel && loading) {
    return (
      <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
        <header className="sticky top-0 z-10 bg-[#FFF1CA] border-b border-[#FFB823]/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ChannelHeaderSkeleton />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="bg-[#FFF1CA] min-h-screen flex items-center justify-center">
        <div className="text-black text-lg">Channel not found</div>
      </div>
    );
  }

  const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
};

  return (
    <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="sticky top-0 z-10 bg-[#FFF1CA] border-b border-[#FFB823]/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-[#FFB823]/10 rounded-lg transition-colors"
                title="Back to home"
              >
                <FaArrowLeft className="text-black text-xl" />
              </button>
              <div>
                <h1 className="flex text-center text-black text-2xl font-semibold">{channel.name} 
                    {channel.verified === true && (
                          <Tooltip text="Verified Channel">
                            <FaCheckCircle className="ml-2 text-green-500" />
                          </Tooltip>
                    )}
                </h1>
                <p className="text-black/70 text-sm">{channel.description}</p>
              </div>
            </div>
              <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-black/60">
                <FaUsers />
                <span className="text-sm">{channel.member_count} members</span>
              </div>
              
              {!isJoined(channelId) ? (
                <button
                  onClick={handleJoinChannel}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center space-x-2"
                >
                  <FaUserPlus />
                  <span>Join Channel</span>
                </button>
              ) : (
                <button
                  onClick={handleLeaveChannel}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm flex items-center space-x-2"
                >
                  <FaUserMinus />
                  <span>Leave Channel</span>
                </button>
              )}
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
              >
                New Post
              </button>
            </div>
          </div>

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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        ) : getFilteredPosts().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-semibold text-black mb-2">No posts yet</h3>
            <p className="text-black/60 mb-6">Be the first to post in this channel!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredPosts().map((post) => (
                <PostCard key={post.id} post={post} getRelativeTime={getRelativeTime} />
              ))}
            </div>
            
            {loadingMore && (
              <LoadMoreSkeleton />
            )}
          </>
        )}
      </main>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
        selectedChannel={channelId}
      />
    </div>
  );
}