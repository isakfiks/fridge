import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { postId, postTitle, postAuthor, category, reason } = await request.json()

    if (!postId || !category || !reason || !postTitle || !postAuthor) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          post_id: postId,
          post_title: postTitle,
          post_author: postAuthor,
          category: category,
          reason: reason,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to create report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Report submitted successfully', 
      report: data[0] 
    })

  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
