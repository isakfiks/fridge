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

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .is('channel_id', null)
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