import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Activity, Code, Server, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { getLogs, clearLogs, type ApiLog } from '../lib/logger';
import { Button } from '../components/ui/button';

export function Logs() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getLogs());
    const handleUpdate = () => setLogs(getLogs());
    window.addEventListener('careeragent_logs_updated', handleUpdate);
    return () => window.removeEventListener('careeragent_logs_updated', handleUpdate);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              API Transparency Logs
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              An open record of all communication between the extension and AI models.
            </p>
          </div>
          {logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pb-12 pr-2">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card border border-border/80 rounded-xl shadow-2xs">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No API calls yet</h3>
              <p className="text-muted-foreground max-w-sm">
                As the extension interacts with AI on your behalf, the exact payloads sent and received will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.status >= 400 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <Server className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{log.action}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status >= 400 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{log.endpoint}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {expandedLogId === log.id ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {expandedLogId === log.id && (
                    <div className="p-4 border-t border-border/80 bg-muted/10 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-2">
                          <Code className="h-3.5 w-3.5" />
                          Request Payload
                        </div>
                        <div className="bg-background border border-border/80 rounded-lg p-3 overflow-x-auto max-h-[400px] overflow-y-auto">
                          <pre className="text-[11px] font-mono text-muted-foreground">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground mb-2">
                          <Code className="h-3.5 w-3.5" />
                          Response Payload
                        </div>
                        <div className="bg-background border border-border/80 rounded-lg p-3 overflow-x-auto max-h-[400px] overflow-y-auto">
                          <pre className="text-[11px] font-mono text-muted-foreground">
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
