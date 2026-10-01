import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { getLogs, clearLogs, type ApiLog } from '../lib/logger';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { Page, PageHeader } from '../components/ui/page';
import { cn } from '../lib/utils';

export function Logs() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getLogs());
    const update = () => setLogs(getLogs());
    window.addEventListener('careeragent_logs_updated', update);
    return () => window.removeEventListener('careeragent_logs_updated', update);
  }, []);

  return (
    <Page>
      <PageHeader
        title="AI activity"
        description="Every call the extension made to an AI provider on your behalf this session, with the exact request and response."
        actions={
          logs.length > 0 && (
            <Button onClick={clearLogs}>
              <Trash2 />
              Clear
            </Button>
          )
        }
      />
      <p className="mb-6 text-sm text-muted-foreground">
        <Link to="/settings" className="text-primary-text underline-offset-2 hover:underline">
          Back to settings
        </Link>
      </p>

      {logs.length === 0 ? (
        <EmptyState icon={<Activity />} title="No calls yet" body="When you fill search defaults from a resume or draft an answer with the extension, the payloads show up here." />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {logs.map((log) => {
            const open = expanded === log.id;
            const failed = log.status >= 400;
            return (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : log.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 cursor-pointer"
                >
                  {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium text-foreground">{log.action}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()} · {log.endpoint}
                    </span>
                  </span>
                  <span className={cn('rounded-sm px-2 py-0.5 text-sm font-medium tabular-nums', failed ? 'bg-destructive/10 text-destructive' : 'bg-success-soft text-success')}>{log.status}</span>
                </button>
                {open && (
                  <div className="grid grid-cols-1 gap-4 border-t border-border bg-muted/40 p-4 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-1.5 text-sm font-medium text-foreground">Request</h3>
                      <pre className="max-h-80 overflow-auto rounded-sm border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground">{JSON.stringify(log.requestBody, null, 2)}</pre>
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-sm font-medium text-foreground">Response</h3>
                      <pre className="max-h-80 overflow-auto rounded-sm border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground">{JSON.stringify(log.responseBody, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
