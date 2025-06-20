import Image from "next/image";
import { FaUser } from "react-icons/fa";


export default function Home() {
  // Using mock rn, supabase soon
  const posts = [
    {
      id: 0,
      title: "Some catchy post title",
      description: "Post description bla bla bla..",
      image: "/post.jpg",
      author: "lorem",
      hasImage: true
    },
    {
      id: 1,
      title: "Some catchy post title",
      description: "Post description bla bla bla..",
      image: "",
      author: "lorem",
      hasImage: false
    },
    {
      id: 2,
      title: "Some catchy post title",
      description: "Post description bla bla bla..",
      image: "",
      author: "lorem",
      hasImage: false
    },
    {
      id: 3,
      title: "Some catchy post title",
      description: "Post description bla bla bla..",
      image: "",
      author: "lorem",
      hasImage: false
    },
  ]
  return (
    <div className="bg-[#FFF1CA] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="sticky top-0 z-10 bg-[#FFF1CA] items-center flex w-full justify-between p-8 pt-8 pb-4">
        <div className="flex items-center">
          <h1 className="text-black text-xl mr-2">Fridge</h1>
          <h1 className="text-black text-xl mr-2">|</h1>
          <h1 className="text-black text-xl font-bold">Global</h1>
        </div>
        <button className="bg-[#FFB823] p-2 text-black rounded-xl">New Post</button>
      </header>

      <main className="p-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-start">
          {posts.map((post) => (
            <button key={post.id} id={`post${post.id}`} className="rounded-lg text-black bg-[#FFB823] p-8 w-full block">
              <p className="text-lg font-semibold">
                {post.title}
              </p>
              <p>{post.description}</p>
              {post.hasImage && (
                <div className="mt-4 flex justify-center">
                  <Image className="rounded-lg border-2 border-black" width="200" height="200" src={post.image} alt="placeholder"></Image>
                </div>
              )}
              <p className="mt-4 justify-center items-center flex">
                <FaUser className="mr-1"></FaUser>
                {post.author}
              </p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}