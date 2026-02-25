import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveApiKey } from '../src/client.js';
import { HoldedConfigError } from '../src/errors.js';

describe('resolveApiKey', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env['HOLDED_API_KEY'];
    delete process.env['HOLDED_API_KEY_ACME'];
    delete process.env['HOLDED_API_KEY_MY_CLIENT'];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns explicit apiKey when provided', () => {
    expect(resolveApiKey({ apiKey: 'test-key' })).toBe('test-key');
  });

  it('resolves profile to HOLDED_API_KEY_<PROFILE>', () => {
    process.env['HOLDED_API_KEY_ACME'] = 'acme-key';
    expect(resolveApiKey({ profile: 'acme' })).toBe('acme-key');
  });

  it('converts profile to uppercase and replaces hyphens', () => {
    process.env['HOLDED_API_KEY_MY_CLIENT'] = 'my-client-key';
    expect(resolveApiKey({ profile: 'my-client' })).toBe('my-client-key');
  });

  it('falls back to HOLDED_API_KEY env var', () => {
    process.env['HOLDED_API_KEY'] = 'default-key';
    expect(resolveApiKey()).toBe('default-key');
  });

  it('prefers explicit apiKey over profile', () => {
    process.env['HOLDED_API_KEY_ACME'] = 'acme-key';
    expect(resolveApiKey({ apiKey: 'explicit', profile: 'acme' })).toBe('explicit');
  });

  it('throws HoldedConfigError when profile env var is missing', () => {
    expect(() => resolveApiKey({ profile: 'missing' })).toThrow(HoldedConfigError);
    expect(() => resolveApiKey({ profile: 'missing' })).toThrow(/HOLDED_API_KEY_MISSING/);
  });

  it('throws HoldedConfigError when no key is available', () => {
    expect(() => resolveApiKey()).toThrow(HoldedConfigError);
    expect(() => resolveApiKey()).toThrow(/HOLDED_API_KEY/);
  });
});
