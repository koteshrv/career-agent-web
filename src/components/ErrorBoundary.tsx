import { Component, type ReactNode } from 'react';
import { EmptyState } from './ui/empty-state';
import { Button } from './ui/button';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="Something broke on this page"
            body={this.state.error.message}
            action={
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
