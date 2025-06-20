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
    <div className="rounded-lg text-black bg-[#FFB823] p-8 w-full">
      <p className="flex justify-center items-center text-lg font-semibold">
        {post.title} {reactions >= 50 && (
          <div className="items-center p-1 rounded-lg ml-2 bg-white">
            <FaStar></FaStar>
          </div>
        )}
      </p>
      <p>{post.description}</p>
      {post.hasImage && (
        <div className="mt-4 flex justify-center">
          <Image className="rounded-lg border-2 border-black" width="200" height="200" src={post.image} alt="placeholder"></Image>
        </div>
      )}
      <div className="flex justify-center">
        <p className="mr-4 mt-4 justify-center items-center flex">
          <FaUser className="mr-1"></FaUser>
          {post.author}
        </p>
        <button 
          onClick={handleReaction}
          disabled={isReacting || hasReacted}
          className={`mt-4 justify-center items-center flex transition-colors ${
            hasReacted ? 'text-red-600' : 'hover:text-red-500'
          } ${isReacting ? 'opacity-50' : ''}`}
        >
          <FaHeart className={`mr-1 ${hasReacted ? 'text-red-600' : ''}`}></FaHeart>
          {reactions}
        </button>
      </div>
    </div>
  )
}
