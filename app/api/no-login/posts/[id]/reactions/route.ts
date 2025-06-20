import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id)
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Get the current count
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('reactions')
      .eq('id', postId)
      .single()

    if (fetchError) {
      console.error('Error fetching current post:', fetchError)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const newReactionCount = (currentPost.reactions || 0) + 1

    const { data, error } = await supabase
      .from('posts')
      .update({ reactions: newReactionCount })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Error updating reactions:', error)
      return NextResponse.json({ error: 'Failed to update reactions' }, { status: 500 })
    }

    return NextResponse.json({ reactions: data.reactions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
