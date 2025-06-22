'use client'

import { useState } from 'react'
import Image from "next/image"
import { FaUser, FaHeart, FaStar } from "react-icons/fa"

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  reactions: number;
  created_at: string;
}

interface Reply {
  id: number;
  post_id: number;
  content: string;
  author: string;
  created_at: string;
}

interface PostCardProps {
  post: Post;
  getRelativeTime: (dateString: string) => string;
}

export default function PostCard({ post, getRelativeTime }: PostCardProps) {
  const [reactions, setReactions] = useState(post.reactions)
  const [isReacting, setIsReacting] = useState(false)
  const [hasReacted, setHasReacted] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)

  const fetchReplies = async () => {
    if (repliesLoaded) return
    
    setIsLoadingReplies(true)
    try {
      const response = await fetch(`/api/no-login/posts/${post.id}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
        setRepliesLoaded(true)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setIsLoadingReplies(false)
    }
  }

  const handleToggleReplies = () => {
    if (!showReplies && !repliesLoaded) {
      fetchReplies()
    }
    setShowReplies(!showReplies)
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    
    try {
      const response = await fetch(`/api/no-login/posts/${post.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          author: 'Anonymous'
        })
      })

      if (response.ok) {
        const newReply = await response.json()
        setReplies([...replies, newReply])
        setReplyContent('')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleReaction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isReacting || hasReacted) return

    setIsReacting(true)
    
    try {
      const response = await fetch(`/api/no-login/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReactions(data.reactions)
        setHasReacted(true)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    } finally {
      setIsReacting(false)
    }
  }
  return (
    <div className="bg-[#FFB823] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-black line-clamp-2">
            {post.title}
          </h3>
          {reactions >= 50 && (
            <div className="bg-white p-2 rounded-lg flex-shrink-0 ml-2">
              <FaStar className="text-[#FFB823]" />
            </div>
          )}
        </div>
        <p className="text-black/80 text-sm leading-relaxed line-clamp-3">
          {post.description}
        </p>
      </div>

      {post.hasImage && (
        <div className="mb-4">
          <Image 
            className="rounded-lg border border-black/10 w-full h-40 object-cover" 
            width={300} 
            height={160} 
            src={post.image} 
            alt={post.title}
          />
        </div>
      )}      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-black/70">
          <FaUser className="mr-2" />
          <span className="font-medium">{post.author}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-black/60 text-xs">{getRelativeTime(post.created_at)}</span>
          <button 
            onClick={handleReaction}
            disabled={isReacting || hasReacted}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              hasReacted 
                ? 'text-red-600 bg-red-50' 
                : 'text-black/70 hover:text-red-500 hover:bg-white/20'
            } ${isReacting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaHeart className={hasReacted ? 'text-red-600' : ''} />
            <span className="font-medium">{reactions}</span>
          </button>
        </div>
      </div>
      <div className="mt-6 border-t border-black/10 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className='text-black font-medium'>Replies:</p>
          <button
            onClick={handleToggleReplies}
            className="text-black/70 hover:text-black text-sm font-medium transition-colors"
            disabled={isLoadingReplies}
          >
            {isLoadingReplies ? 'Loading...' : showReplies ? 'Hide Replies' : 'Show Replies'}
          </button>
        </div>
        
        {showReplies && (
          <>
            <div className="mb-4">
              <form onSubmit={handleSubmitReply} className="flex items-center gap-2 flex-wrap">
                <input 
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 rounded-full px-4 py-2 bg-white/50 text-black placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-black/20 min-w-0"
                  disabled={isSubmittingReply}
                />
                <button 
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="bg-white/20 hover:bg-white/30 text-black px-4 py-2 rounded-full transition-colors mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReply ? 'Sending...' : 'Reply'}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-white/10 rounded-lg p-3">
                  <div className='flex items-center mb-2'>
                    <FaUser className='text-black/70 mr-2' />
                    <p className='text-black font-medium'>{reply.author}</p>
                    <span className="text-black/50 text-xs ml-2">{getRelativeTime(reply.created_at)}</span>
                  </div>
                  <p className='text-black/80 text-sm'>{reply.content}</p>
                </div>
              ))}
              {replies.length === 0 && repliesLoaded && (
                <p className="text-black/50 text-sm italic">No replies yet. Be the first to reply!</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}