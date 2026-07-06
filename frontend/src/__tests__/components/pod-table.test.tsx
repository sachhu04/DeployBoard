import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PodTable } from '@/components/dashboard/pod-table';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Terminal: () => <div data-testid="terminal-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

describe('PodTable', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockPods = [
    {
      name: 'test-pod-1',
      namespace: 'default',
      status: 'Running',
      restarts: 0,
      age: '5m',
      node: 'node-1',
      cpu: '10m',
      memory: '50Mi',
    },
    {
      name: 'test-pod-2',
      namespace: 'default',
      status: 'CrashLoopBackOff',
      restarts: 5,
      age: '1h',
      node: 'node-2',
      cpu: '0m',
      memory: '10Mi',
    },
  ];

  it('renders correctly with pods', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PodTable 
          pods={mockPods} 
        />
      </QueryClientProvider>
    );
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check pod data
    expect(screen.getByText('test-pod-1')).toBeInTheDocument();
    expect(screen.getByText('test-pod-2')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('CrashLoopBackOff')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PodTable 
          pods={[mockPods[0]]} 
        />
      </QueryClientProvider>
    );
    
    expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
  });
});
