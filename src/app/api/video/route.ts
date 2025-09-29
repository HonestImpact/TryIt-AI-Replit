import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@replit/object-storage';

export async function GET(request: NextRequest) {
  try {
    const client = new Client({ bucketId: 'tryit-ai-media' });
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file') || 'intro-video.mp4';
    
    console.log('Looking for file:', filename, 'in bucket: tryit-ai-media');
    
    // First, let's list all files in the bucket to see what's available
    try {
      const listResult = await client.list();
      console.log('Files in bucket:', listResult.ok ? listResult.value.map(f => f.key) : 'List failed');
    } catch (listError) {
      console.log('Could not list bucket contents:', listError);
    }
    
    // Download the video file from the bucket
    const result = await client.downloadAsBytes(filename);
    
    if (!result.ok) {
      console.error('Download failed:', result.error);
      return NextResponse.json({ 
        error: 'Video not found', 
        filename,
        bucketId: 'tryit-ai-media',
        details: result.error 
      }, { status: 404 });
    }

    const videoBuffer = result.value[0];
    console.log('Successfully found video file, size:', videoBuffer.length, 'bytes');

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
    return NextResponse.json({ 
      error: 'Video not found', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 404 });
  }
}