import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching channel posts:', error);
      return NextResponse.json({ error: 'Failed to fetch channel posts' }, { status: 500 });
    }
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params;
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const author = formData.get('author') as string;
    const hasImage = formData.get('hasImage') === 'true';
    const imageFile = formData.get('image') as File | null;

    if (!title || !description || !author) {
      return NextResponse.json({ error: 'Title, description, and author are required' }, { status: 400 });
    }

    let imagePath = '';
    if (hasImage && imageFile) {
      try {
        // Upload image using the same method as the main posts
        const { put } = await import('@vercel/blob');
        const blob = await put(`posts/${Date.now()}-${imageFile.name}`, imageFile, {
          access: 'public',
        });
        imagePath = blob.url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        imagePath = '';
      }
    }    const { data: newPost, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          description,
          image: imagePath,
          author,
          hasImage: hasImage && imagePath !== '',
          reactions: 0,
          channel_id: channelId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating channel post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating channel post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}