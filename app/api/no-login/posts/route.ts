import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { put } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '8')
    const offset = (page - 1) * limit

    const { data: posts, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .is('channel_id', null)
      .order('reactions', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    })
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
        },
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