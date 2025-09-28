import { NextRequest, NextResponse } from 'next/server';
import { analyticsPool } from '@/lib/analytics/connection-pool';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    if (table) {
      // Get data from specific table
      const validTables = ['user_sessions', 'conversations', 'messages', 'generated_tools', 'tool_usage_events'];
      if (!validTables.includes(table)) {
        return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
      }

      const data = await analyticsPool.executeQuery(
        `SELECT * FROM ${table} ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );

      return NextResponse.json({ table, data, count: data?.length || 0 });
    } else {
      // Get table counts
      const counts = await analyticsPool.executeQuery(`
        SELECT 'user_sessions' as table_name, COUNT(*) as count FROM user_sessions
        UNION ALL
        SELECT 'conversations', COUNT(*) FROM conversations  
        UNION ALL
        SELECT 'messages', COUNT(*) FROM messages
        UNION ALL
        SELECT 'generated_tools', COUNT(*) FROM generated_tools
        UNION ALL
        SELECT 'tool_usage_events', COUNT(*) FROM tool_usage_events
        ORDER BY table_name
      `);

      return NextResponse.json({ counts });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ 
      error: 'Database query failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}