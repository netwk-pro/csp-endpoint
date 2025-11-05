/**
 * @file Unit tests for netlify/functions/csp-report.js using Vitest
 * @module tests/unit
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../netlify/functions/csp-report.js';

// 🧪 Mock fetch for sendToNtfy
global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, status: 200, text: () => 'OK' }),
);

describe('csp-report.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle a valid CSP report', async () => {
    const event = {
      httpMethod: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'csp-report': {
          'document-uri': 'https://example.com',
          'violated-directive': 'script-src',
          'blocked-uri': 'https://malicious.site',
        },
      }),
    };

    const res = await handler(event, {});
    expect(res.statusCode).toBe(204);
  });

  it('should reject non-POST requests', async () => {
    const event = {
      httpMethod: 'GET',
    };

    const res = await handler(event, {});
    expect(res.statusCode).toBe(405);
    expect(res.body).toContain('Method Not Allowed');
  });

  it('should handle malformed JSON', async () => {
    const event = {
      httpMethod: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json }',
    };

    const res = await handler(event, {});
    expect(res.statusCode).toBe(204);
  });

  it('should handle missing body', async () => {
    const event = {
      httpMethod: 'POST',
    };

    const res = await handler(event, {});
    expect(res.statusCode).toBe(204);
  });
});
