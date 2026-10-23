import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Search, RefreshCw, AlertCircle, Info, Terminal, X, ShieldAlert } from 'lucide-react';
import { getAdminLogs } from '../../services/api';

function ActivityLogs() {
  const [rawLogs, setRawLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'api', 'errors', 'contact_errors', 'news'

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAdminLogs();
      setRawLogs(data.logs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Parse logs into structured entries
  const parsedLogs = useMemo(() => {
    if (!rawLogs) return [];
    const lines = rawLogs.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, idx) => {
      const regex = /^\[([\d-:\s]+)\]\s+\[IP:\s+([^\]]+)\]\s+\[UA:\s+([^\]]+)\]\s+(.*)$/;
      const match = line.match(regex);
      if (match) {
        return {
          id: idx,
          timestamp: match[1],
          ip: match[2],
          userAgent: match[3],
          action: match[4],
          raw: line
        };
      }
      return {
        id: idx,
        timestamp: '',
        ip: '',
        userAgent: '',
        action: line,
        raw: line
      };
    }).reverse(); // Display most recent first
  }, [rawLogs]);

  // Search and filter algorithm
  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
      // 1. Filter by category
      if (selectedCategory === 'api') {
        if (!log.action.toLowerCase().includes('api action:')) return false;
      } else if (selectedCategory === 'errors') {
        const isError = log.action.toLowerCase().includes('error') || log.action.toLowerCase().includes('fail');
        if (!isError) return false;
      } else if (selectedCategory === 'contact_errors') {
        if (!log.action.toLowerCase().includes('contact form error:')) return false;
      } else if (selectedCategory === 'news') {
        if (!log.action.toLowerCase().includes('news') && !log.action.toLowerCase().includes('bot')) return false;
      }

      // 2. Filter by multi-keyword search query
      if (!searchQuery.trim()) return true;
      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      const logContent = `${log.timestamp} ${log.ip} ${log.userAgent} ${log.action} ${log.raw}`.toLowerCase();
      
      return keywords.every(keyword => logContent.includes(keyword));
    });
  }, [parsedLogs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-sm text-text-light/80 mt-1">Monitor, filter, and search bot executions, system events, and client actions.</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <RefreshCw className="animate-spin" size={16} />
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <RefreshCw size={16} />
              Refresh Logs
            </span>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="pt-6">
            <div className="text-danger font-medium">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Controls */}
      <Card className="bg-surface-container-lowest border-surface-variant/40 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-light/50">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by IP, action details, timestamp, or User Agent..."
                className="w-full pl-10 pr-10 py-2.5 border border-primary/10 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-text-light/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-text-light/50 hover:text-on-surface transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-text-light border-primary/10 hover:bg-surface-container-low'
                }`}
              >
                All Logs
              </button>
              <button
                onClick={() => setSelectedCategory('api')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === 'api'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-text-light border-primary/10 hover:bg-surface-container-low'
                }`}
              >
                API Actions
              </button>
              <button
                onClick={() => setSelectedCategory('contact_errors')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === 'contact_errors'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-text-light border-primary/10 hover:bg-surface-container-low'
                }`}
              >
                Contact Errors
              </button>
              <button
                onClick={() => setSelectedCategory('errors')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === 'errors'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-text-light border-primary/10 hover:bg-surface-container-low'
                }`}
              >
                All Errors
              </button>
              <button
                onClick={() => setSelectedCategory('news')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === 'news'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-text-light border-primary/10 hover:bg-surface-container-low'
                }`}
              >
                News Bot
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display List */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-surface-variant/30">
          <CardTitle className="text-xl">Execution Records</CardTitle>
          <div className="text-sm text-text-light font-semibold bg-surface-container-low px-3 py-1 rounded-full">
            Showing {filteredLogs.length} of {parsedLogs.length} logs
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-text-light">
              <Terminal size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-lg">No Matching Logs</p>
              <p className="text-sm mt-1">Try resetting the filters or tweaking your search keywords.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-variant/30 max-h-[600px] overflow-y-auto">
              {filteredLogs.map(log => {
                const isError = log.action.toLowerCase().includes('error') || log.action.toLowerCase().includes('fail');
                const isContactError = log.action.toLowerCase().includes('contact form error:');
                const isApi = log.action.toLowerCase().includes('api action:');
                
                return (
                  <div key={log.id} className="p-4 hover:bg-surface-container-low/30 transition-colors flex flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* Log Level / Category badge */}
                        {isContactError ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-secondary/15 text-secondary px-2 py-0.5 rounded">
                            <ShieldAlert size={12} /> Contact Error
                          </span>
                        ) : isError ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-danger/10 text-danger px-2 py-0.5 rounded">
                            <AlertCircle size={12} /> Error
                          </span>
                        ) : isApi ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                            <Terminal size={12} /> API Action
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-surface-container-low text-text-light px-2 py-0.5 rounded">
                            <Info size={12} /> Info
                          </span>
                        )}

                        {/* Client IP Badge */}
                        {log.ip && (
                          <span className="text-xs bg-surface-container-low text-on-surface px-2 py-0.5 rounded font-mono font-medium">
                            {log.ip}
                          </span>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-xs text-text-light font-mono font-medium">
                        {log.timestamp}
                      </span>
                    </div>

                    {/* Action / Event Description */}
                    <div className="text-sm font-semibold text-on-surface break-words leading-relaxed pl-1">
                      {log.action}
                    </div>

                    {/* User Agent Subtext */}
                    {log.userAgent && (
                      <div className="text-xs text-text-light/60 font-mono truncate pl-1" title={log.userAgent}>
                        UA: {log.userAgent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityLogs;
