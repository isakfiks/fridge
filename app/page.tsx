'use client'

import { useState, useEffect } from "react";
import { FaGlobe } from "react-icons/fa";
import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  reactions: number;
}

const mockPosts: Post[] = [
  {
    id: 0,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "/post.jpg",
    author: "lorem",
    hasImage: true,
    reactions: 56
  },
  {
    id: 1,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "ipsum",
    hasImage: false,
    reactions: 20
  },
  {
    id: 2,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "ranoutof",
    hasImage: false,
    reactions: 20
  },
  {
    id: 3,
    title: "Some catchy post title",
    description: "Post description bla bla bla..",
    image: "",
    author: "placeholders",
    hasImage: false,
    reactions: 20
  },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/no-login/posts', {
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

  useEffect(() => {
    fetchPosts();
  }, []);//

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="sticky top-0 z-10 bg-[#FFF1CA] border-b border-[#FFB823]/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-black text-2xl font-semibold">Fridge</h1>
            <div className="w-px h-6 bg-black/20"></div>
            <FaGlobe className="text-black text-xl"></FaGlobe>
            <h1 className="text-black text-xl font-bold">Global</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FFB823] px-6 py-3 text-black rounded-xl hover:bg-[#ffad00] transition-colors font-medium shadow-sm"
          >
            New Post
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-black text-lg">Loading posts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}