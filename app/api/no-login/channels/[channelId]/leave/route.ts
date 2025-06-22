import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    
    // Verify the channel exists
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, name')
      .eq('id', channelId)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    const { error: updateError } = await supabase
      .rpc('decrement_member_count', { channel_id: channelId });

    if (updateError) {
      console.error('Error updating member count:', updateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully left channel ${channel.name}`,
      channelId: channelId,
      channelName: channel.name
    });
  } catch (error) {
    console.error('Error leaving channel:', error);
    return NextResponse.json({ error: 'Failed to leave channel' }, { status: 500 });
  }
}