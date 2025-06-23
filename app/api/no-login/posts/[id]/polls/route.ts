import { NextResponse } from 'next/server'
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

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('post_id', postId)
      .single()

    if (pollError) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', poll.id)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    // Count votes for each option
    const voteCounts = poll.options.map((_: any, index: number) => 
      votes.filter(vote => vote.option_index === index).length
    )

    return NextResponse.json({
      ...poll,
      voteCounts,
      totalVotes: votes.length
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const postId = parseInt(params.id)
    const { optionIndex } = await request.json()
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    if (typeof optionIndex !== 'number' || optionIndex < 0) {
      return NextResponse.json({ error: 'Invalid option index' }, { status: 400 })
    }

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, options')
      .eq('post_id', postId)
      .single()

    if (pollError) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (optionIndex >= poll.options.length) {
      return NextResponse.json({ error: 'Invalid option index' }, { status: 400 })
    }

    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: poll.id,
        option_index: optionIndex
      })

    if (voteError) {
      console.error('Error adding vote:', voteError)
      return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 })
    }

    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', poll.id)

    if (votesError) {
      console.error('Error fetching updated votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch updated votes' }, { status: 500 })
    }

    const voteCounts = poll.options.map((_: any, index: number) => 
      votes.filter(vote => vote.option_index === index).length
    )

    return NextResponse.json({
      voteCounts,
      totalVotes: votes.length
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
