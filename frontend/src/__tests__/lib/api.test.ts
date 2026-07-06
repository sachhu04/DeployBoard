import { describe, it, expect } from 'vitest';
import { getExecWebSocketUrl } from '@/lib/api';

describe('API Utils', () => {
  describe('getExecWebSocketUrl', () => {
    it('constructs correct wss url for https protocol', () => {
      // Mock window.location
      const originalLocation = window.location;
      
      // @ts-ignore
      delete window.location;
      window.location = {
        ...originalLocation,
        protocol: 'https:',
        host: 'example.com:443',
      };
      
      const url = getExecWebSocketUrl('default', 'test-pod');
      expect(url).toBe('wss://example.com:443/api/ws/exec/default/test-pod');
      
      window.location = originalLocation;
    });

    it('constructs correct ws url for http protocol', () => {
      // Mock window.location
      const originalLocation = window.location;
      
      // @ts-ignore
      delete window.location;
      window.location = {
        ...originalLocation,
        protocol: 'http:',
        host: 'localhost:3000',
      };
      
      const url = getExecWebSocketUrl('default', 'test-pod');
      expect(url).toBe('ws://localhost:3000/api/ws/exec/default/test-pod');
      
      window.location = originalLocation;
    });
  });
});
