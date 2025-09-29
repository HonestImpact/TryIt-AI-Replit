import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@replit/object-storage';

export async function GET(request: NextRequest) {
  try {
    const client = new Client({ bucketId: 'tryit-ai-media' });
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file') || 'intro-video.mp4';
    
    // Download the video file from the bucket
    const result = await client.downloadAsBytes(filename);
    
    if (!result.ok) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const videoBuffer = result.value[0];

    // Return the video with proper headers
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Error serving video:', error);
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }
}