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
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [reactions, setReactions] = useState(post.reactions)
  const [isReacting, setIsReacting] = useState(false)
  const [hasReacted, setHasReacted] = useState(false)

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
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-black/70">
          <FaUser className="mr-2" />
          <span className="font-medium">{post.author}</span>
        </div>
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
  )
}
