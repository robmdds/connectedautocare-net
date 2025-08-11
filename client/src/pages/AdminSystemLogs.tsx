import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, AlertCircle, Info, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminSystemLogs() {
  const [logLevel, setLogLevel] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  const { data: systemLogs, isLoading } = useQuery({
    queryKey: ['/api/admin/system-logs', { level: logLevel, timeRange }],
    retry: false,
  });

  // Sample log data for demonstration
  const sampleLogs = [
    {
      id: '1',
      timestamp: '2025-08-11T09:58:38.123Z',
      level: 'info',
      service: 'auth',
      message: 'User login successful',
      details: { userId: '45865666', email: 'rm@pdgsinc.com' }
    },
    {
      id: '2',
      timestamp: '2025-08-11T09:58:39.456Z',
      level: 'info',
      service: 'admin',
      message: 'System stats requested',
      details: { endpoint: '/api/admin/system-stats', responseTime: '75ms' }
    },
    {
      id: '3',
      timestamp: '2025-08-11T09:59:08.789Z',
      level: 'info',
      service: 'rates',
      message: 'Rate tables retrieved',
      details: { count: 6, tenant: 'admin', responseTime: '190ms' }
    },
    {
      id: '4',
      timestamp: '2025-08-11T09:59:26.012Z',
      level: 'info',
      service: 'coverage',
      message: 'Coverage options fetched',
      details: { providers: 2, products: 9, responseTime: '191ms' }
    },
    {
      id: '5',
      timestamp: '2025-08-11T09:45:12.345Z',
      level: 'warning',
      service: 'payment',
      message: 'Helcim API key not configured',
      details: { endpoint: '/api/payments/process' }
    },
    {
      id: '6',
      timestamp: '2025-08-11T09:30:45.678Z',
      level: 'error',
      service: 'database',
      message: 'Connection pool exhausted',
      details: { activeConnections: 20, maxConnections: 20 }
    }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const filteredLogs = sampleLogs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Log Filters
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div>
                  <label className="text-sm font-medium">Log Level</label>
                  <Select value={logLevel} onValueChange={setLogLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Log Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading system logs...</div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">{log.service}</span>
                          {getLogBadge(log.level)}
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}