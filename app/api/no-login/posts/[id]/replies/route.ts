import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const postId = parseInt(params.id)
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const { data: replies, error } = await supabase
      .from('replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching replies:', error)
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
    }

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const postId = parseInt(params.id)
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    const { content, author, parent_id } = await request.json()

    if (!content || !author) {
      return NextResponse.json({ error: 'Content and author are required' }, { status: 400 })
    }

    if (parent_id) {
      const { data: parentReply, error: parentError } = await supabase
        .from('replies')
        .select('id, post_id')
        .eq('id', parent_id)
        .single()

      if (parentError || !parentReply) {
        return NextResponse.json({ error: 'Invalid parent reply' }, { status: 400 })
      }

      if (parentReply.post_id !== postId) {
        return NextResponse.json({ error: 'Parent reply must belong to the same post' }, { status: 400 })
      }
    }

    const { data: newReply, error } = await supabase
      .from('replies')
      .insert([
        {
          post_id: postId,
          content,
          author,
          parent_id: parent_id || null,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating reply:', error)
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
    }

    return NextResponse.json(newReply, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}
