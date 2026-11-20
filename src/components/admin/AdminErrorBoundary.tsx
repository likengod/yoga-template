import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white border border-red-100 rounded-2xl shadow-sm text-center my-6 max-w-xl mx-auto animate-fade-in">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {this.props.fallbackTitle || 'Component Error'}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {this.state.error?.message || 'An unexpected error occurred while loading this section.'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-yoga-sage hover:bg-yoga-forest text-white gap-2 rounded-full px-6"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Section
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
