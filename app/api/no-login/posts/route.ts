import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { put } from '@vercel/blob'

interface Post {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  hasImage: boolean;
  reactions: number;
  createdAt: string;
}

const mockPosts: Post[] = [
  {
    id: 0,
    title: "Amazing sunset from my balcony",
    description: "Caught this beautiful sunset today while having coffee on my balcony. Nature never fails to amaze me!",
    image: "/sunset.jpg",
    author: "naturelover",
    hasImage: true,
    reactions: 42,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 1,
    title: "Homemade pasta recipe",
    description: "Just tried making pasta from scratch for the first time. It's easier than I thought!",
    image: "",
    author: "foodie123",
    hasImage: false,
    reactions: 28,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 2,
    title: "Morning workout complete",
    description: "5km run done! Starting the day with some endorphins. Who else is working out today?",
    image: "",
    author: "runnerboy",
    hasImage: false,
    reactions: 15,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
  },
  {
    id: 3,
    title: "New book recommendation",
    description: "Just finished reading 'The Midnight Library' - what a journey! Highly recommend for anyone looking for their next read.",
    image: "",
    author: "bookworm",
    hasImage: false,
    reactions: 33,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },
  {
    id: 4,
    title: "Coffee art practice",
    description: "Been practicing latte art for weeks. Finally managed to make a decent leaf pattern!",
    image: "/latte.jpg",
    author: "barista_wannabe",
    hasImage: true,
    reactions: 67,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() // 18 hours ago
  },
  {
    id: 5,
    title: "Weekend hiking plans",
    description: "Planning to hike the local trail this weekend. Weather looks perfect! Anyone want to join?",
    image: "",
    author: "trailblazer",
    hasImage: false,
    reactions: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 6,
    title: "Garden update",
    description: "My tomatoes are finally turning red! This year's garden is looking amazing despite the late start.",
    image: "/tomatoes.jpg",
    author: "greenthumbs",
    hasImage: true,
    reactions: 89,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },  {
    id: 7,
    title: "Movie night recommendations",
    description: "Looking for good movies to watch tonight. Any suggestions for something light and fun?",
    image: "",
    author: "moviebuff",
    hasImage: false,
    reactions: 24,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
];

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const author = formData.get('author') as string
    const hasImage = formData.get('hasImage') === 'true'
    const imageFile = formData.get('image') as File | null

    let imagePath = ''
    if (hasImage && imageFile) {
      try {
        // Upload image
        const blob = await put(`posts/${Date.now()}-${imageFile.name}`, imageFile, {
          access: 'public',
        })
        imagePath = blob.url
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError)
        // Continue without image as a fallback
        imagePath = ''
      }
    }

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          description,
          image: imagePath,
          author,
          hasImage: hasImage && imagePath !== '',
          reactions: 0,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}