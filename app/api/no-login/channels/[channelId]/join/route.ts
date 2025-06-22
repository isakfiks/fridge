import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, name')
      .eq('id', channelId)
      .single();

    if (channelError || !channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .rpc('increment_member_count', { channel_id: channelId });

    if (updateError) {
      console.error('Error updating member count:', updateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully joined channel ${channel.name}`,
      channelId: channelId,
      channelName: channel.name
    });
  } catch (error) {
    console.error('Error joining channel:', error);
    return NextResponse.json({ error: 'Failed to join channel' }, { status: 500 });
  }
}