import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const hasPoll = formData.get('hasPoll') === 'true'

    console.log('Creating post with hasPoll:', hasPoll)

    let imageUrl = ''
    if (hasImage) {
      const image = formData.get('image') as File
      if (image) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, image)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('posts').getPublicUrl(fileName)

        imageUrl = publicUrl
      }
    }

    const postData = {
      title,
      description,
      author,
      hasImage,
      hasPoll,
      image: imageUrl,
      reactions: 0,
    }

    console.log('Post data:', postData) // Dbg

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (postError) {
      console.error('Error creating post:', postError)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    if (hasPoll) {
      const pollQuestion = formData.get('pollQuestion') as string
      const pollOptionsString = formData.get('pollOptions') as string

      if (pollQuestion && pollOptionsString) {
        try {
          const pollOptions = JSON.parse(pollOptionsString)

          const { error: pollError } = await supabase
            .from('polls')
            .insert({
              post_id: post.id,
              question: pollQuestion,
              options: pollOptions,
            })

          if (pollError) {
            console.error('Error creating poll:', pollError)
          }
        } catch (parseError) {
          console.error('Error parsing poll options:', parseError)
        }
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}