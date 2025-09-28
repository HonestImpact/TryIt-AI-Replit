'use client';

import { useState, useEffect } from 'react';

interface TableCounts {
  table_name: string;
  count: string;
}

interface TableData {
  table: string;
  data: any[];
  count: number;
}

export default function DatabaseViewer() {
  const [counts, setCounts] = useState<TableCounts[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/database');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCounts(data.counts || []);
      }
    } catch (err) {
      setError('Failed to fetch database counts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      setLoading(true);
      setSelectedTable(tableName);
      const response = await fetch(`/api/database?table=${tableName}&limit=100`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTableData(data);
      }
    } catch (err) {
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return String(value);
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Viewer</h1>
          <p className="text-slate-600">View analytics data for Noah AI system</p>
          <div className="mt-4">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Noah
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {/* Table Counts Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Database Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {counts.map((item) => (
              <div 
                key={item.table_name}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => fetchTableData(item.table_name)}
              >
                <div className="text-sm text-slate-600 capitalize">
                  {item.table_name.replace('_', ' ')}
                </div>
                <div className="text-2xl font-bold text-slate-900">{item.count}</div>
              </div>
            ))}
          </div>
          <button
            onClick={fetchCounts}
            className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Counts'}
          </button>
        </div>

        {/* Table Data */}
        {tableData && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 capitalize">
                {tableData.table.replace('_', ' ')} ({tableData.count} records)
              </h2>
              <button
                onClick={() => setTableData(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {tableData.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No data found in this table
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {Object.keys(tableData.data[0]).map((key) => (
                        <th key={key} className="text-left py-3 px-4 font-semibold text-slate-700 capitalize">
                          {key.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.data.map((row, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        {Object.entries(row).map(([key, value]) => (
                          <td key={key} className="py-3 px-4 text-slate-600">
                            {key.includes('_at') || key.includes('timestamp') ? 
                              formatTimestamp(value as string) : 
                              formatValue(value)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {loading && !tableData && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="mt-2 text-slate-600">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}