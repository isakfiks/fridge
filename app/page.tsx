import { FaGlobe } from "react-icons/fa";
import PostCard from "./components/PostCard";

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  reactions: number;
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/no-login/posts`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Fallback to mock (might remove later)
    return [
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
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="sticky top-0 z-10 bg-[#FFF1CA] items-center flex w-full justify-between p-8 pt-8 pb-4">
        <div className="flex items-center">
          <h1 className="text-black text-xl mr-2">Fridge</h1>
          <h1 className="text-black text-xl mr-2">|</h1>
          <FaGlobe className="text-black text-xl mr-2"></FaGlobe>
          <h1 className="text-black text-xl font-bold">Global</h1>
        </div>
        <button className="bg-[#FFB823] p-2 text-black rounded-xl hover:bg-[#ffad00]">New Post</button>
      </header>

      <main className="p-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-start">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}