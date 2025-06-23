'use client'

import { useState, useEffect } from "react";
import { FaBookOpen, FaCheckCircle, FaGlobe } from "react-icons/fa";
import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";
import CreateChannelModal from "./components/CreateChannelModal";
import JoinChannelModal from "./components/JoinChannelModal";
import { useJoinedChannels } from "./hooks/useJoinedChannels";
import Link from "next/link";
import React from 'react'

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

const ChannelSkeleton = () => (
  <div className="bg-white rounded-xl p-5 shadow-md animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="h-3 bg-gray-200 rounded mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex items-center justify-between">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

const LoadMoreSkeleton = () => (
  <div className="flex justify-center mt-8">
    <div className="bg-gray-200 px-8 py-3 rounded-xl animate-pulse h-12 w-64"></div>
  </div>
);

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    hasMore: false
  });
  const [sortBy, setSortBy] = useState<'reactions' | 'date'>('reactions');
  const [dateFilter, setDateFilter] = useState<'24h' | '3d' | '7d'>('7d');
  const [viewMode, setViewMode] = useState<'global' | 'channel'>('global');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isJoiningChannel, setIsJoiningChannel] = useState(false);
  
  const { joinedChannels, joinChannel: addToJoined, leaveChannel: removeFromJoined, isJoined } = useJoinedChannels();

  const fetchPosts = async (reset = false) => {
    const currentPage = reset ? 1 : pagination.page;
    
    if (!reset) {
      setLoadingMore(true);
    }
    
    try {
      const endpoint = viewMode === 'global' 
        ? `/api/no-login/posts?page=${currentPage}&limit=${pagination.limit}` 
        : selectedChannel 
          ? `/api/no-login/channels/${selectedChannel}/posts?page=${currentPage}&limit=${pagination.limit}`
          : `/api/no-login/posts?page=${currentPage}&limit=${pagination.limit}`;
          
      const res = await fetch(endpoint, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.posts) {
          if (reset) {
            setPosts(data.posts);
          } else {
            setPosts(prev => [...prev, ...data.posts]);
          }
          setPagination(prev => ({
            ...prev,
            page: currentPage + 1,
            total: data.pagination.total,
            hasMore: data.pagination.hasMore
          }));
        } else {
          if (reset) {
            setPosts(data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Keep existing posts on error
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
    setLoading(true);
    setPosts([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPosts(true);
    fetchChannels();
  }, [viewMode, selectedChannel]);

  const handlePostCreated = () => {
    setLoading(true);
    setPosts([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPosts(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      fetchPosts(false);
    }
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
        addToJoined(newChannel.id);
        window.location.href = `/channel/${newChannel.id}`;
        return true;
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    return false;
  };

  const joinChannel = async (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, member_count: channel.member_count + 1 }
        : channel
    ));
    addToJoined(channelId);

    try {
      const res = await fetch(`/api/no-login/channels/${channelId}/join`, {
        method: 'POST',
      });
      
      if (res.ok) {
        window.location.href = `/channel/${channelId}`;
        return true;
      } else {
        setChannels(prev => prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, member_count: channel.member_count - 1 }
            : channel
        ));
        removeFromJoined(channelId);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, member_count: channel.member_count - 1 }
          : channel
      ));
      removeFromJoined(channelId);
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
              <Link href="/"><h1 className="text-black text-2xl font-semibold">Fridge</h1></Link>
              <div className="w-px h-6 bg-black/20"></div>
              {viewMode === 'global' && <FaGlobe className="text-black text-xl" /> || <FaBookOpen className="text-black text-xl" />}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        ) : viewMode === 'channel' && !selectedChannel ? (
          <div className="space-y-8">
            {joinedChannels.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black">My Channels</h2>
                  <span className="text-sm text-black/60">{joinedChannels.length} joined</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.filter(channel => isJoined(channel.id)).map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => window.location.href = `/channel/${channel.id}`}
                      className="bg-[#FFB823] rounded-xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer  border-2 border-green-400/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="flex items-center text-lg font-semibold text-black">
                          {channel.name} 
                          {channel.verified === true && (
                            <Tooltip text="Verified Channel">
                              <FaCheckCircle className="ml-2 text-green-500" />
                            </Tooltip>
                          )}
                        </h3>

                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Joined
                        </span>
                      </div>
                      <p className="text-black/80 text-sm mb-3 line-clamp-2">{channel.description}</p>
                      <div className="flex items-center justify-between text-xs text-black/60">
                        <span>{channel.member_count} members</span>
                        <span>{new Date(channel.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">
                  {joinedChannels.length > 0 ? 'Discover More Channels' : 'Available Channels'}
                </h2>
                <button
                  onClick={() => setIsCreatingChannel(true)}
                  className="bg-[#FFB823] px-4 py-2 text-black rounded-lg hover:bg-[#ffad00] transition-colors font-medium text-sm"
                >
                  Create Channel
                </button>
              </div>
              
              {channels.length === 0 && loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ChannelSkeleton key={index} />
                  ))}
                </div>
              ) : channels.filter(channel => !isJoined(channel.id)).length === 0 ? (
                <div className="text-center py-12 bg-white/20 rounded-xl border-2 border-dashed border-[#FFB823]/30">
                  <h3 className="text-lg font-medium text-black mb-2">
                    {joinedChannels.length > 0 ? 'You\'ve joined all channels!' : 'No channels yet'}
                  </h3>
                  <p className="text-black/60 mb-4">
                    {joinedChannels.length > 0 
                      ? 'Create a new channel to start fresh discussions' 
                      : 'Be the first to create a channel and start the conversation'
                    }
                  </p>
                  <button
                    onClick={() => setIsCreatingChannel(true)}
                    className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
                  >
                    Create Channel
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.filter(channel => !isJoined(channel.id)).map((channel) => (
                    <div
                      key={channel.id}
                      className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-[#FFB823]/20 hover:border-[#FFB823]/40"
                    >
                      <h3 className="text-lg font-semibold text-black mb-2 flex items-center">
                        {channel.name} 
                        {channel.verified === true && (
                          <Tooltip text="Verified Channel">
                            <FaCheckCircle className="ml-2 text-green-500" />
                          </Tooltip>
                        )}
                      </h3>
                      <p className="text-black/70 text-sm mb-4 line-clamp-2">{channel.description}</p>
                      <div className="flex items-center justify-between text-xs text-black/60 mb-4">
                        <span>{channel.member_count} members</span>
                        <span>{new Date(channel.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/channel/${channel.id}`}
                          className="flex-1 bg-[#FFB823]/10 px-3 py-2 text-black rounded-lg hover:bg-[#FFB823]/20 transition-colors font-medium text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            joinChannel(channel.id);
                          }}
                          className="bg-[#FFB823] px-4 py-2 text-black rounded-lg hover:bg-[#ffad00] transition-colors font-medium text-sm"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredPosts().map((post) => (
                <PostCard key={post.id} post={post} getRelativeTime={getRelativeTime} />
              ))}
            </div>
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-12 bg-white/20 rounded-xl border-2 border-dashed border-[#FFB823]/30">
                <h3 className="text-lg font-medium text-black mb-2">No posts found</h3>
                <p className="text-black/60 mb-4">Be the first to create a post!</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
                >
                  Create Post
                </button>
              </div>
            )}
            
            {loadingMore && (
              <LoadMoreSkeleton />
            )}
            
            {pagination.hasMore && posts.length > 0 && !loadingMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-[#FFB823] px-8 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load More Posts ({pagination.total - posts.length} remaining)
                </button>
              </div>
            )}
          </>
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
        channels={channels.filter(channel => !joinedChannels.includes(channel.id))}
        onChannelJoined={joinChannel}
      />
    </div>
  );
}