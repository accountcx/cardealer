import { describe, it, expect } from 'vitest';
import {
  normalizeRedirectPath,
  extractQueryString,
  resolveRedirectChain,
  type RedirectLookupItem,
} from '../seo/redirects';

describe('Step 3.3: 301 Redirect Engine & Safe Chain Resolver', () => {
  describe('normalizeRedirectPath()', () => {
    it('should strip trailing slashes except for root /', () => {
      expect(normalizeRedirectPath('/tin-tuc/gia-xe-santafe/')).toBe('/tin-tuc/gia-xe-santafe');
      expect(normalizeRedirectPath('/')).toBe('/');
    });

    it('should ensure leading slash and collapse multiple duplicate slashes', () => {
      expect(normalizeRedirectPath('tin-tuc/bai-viet')).toBe('/tin-tuc/bai-viet');
      expect(normalizeRedirectPath('///tin-tuc///danh-gia//')).toBe('/tin-tuc/danh-gia');
    });

    it('should convert path to lowercase for case-insensitive matching', () => {
      expect(normalizeRedirectPath('/Tin-Tuc/Hyundai-Santa-Fe-2026')).toBe('/tin-tuc/hyundai-santa-fe-2026');
    });

    it('should strip query string before path normalization', () => {
      expect(normalizeRedirectPath('/xe/tucson/?utm_source=google&gclid=123')).toBe('/xe/tucson');
    });

    it('should fallback to / for empty or invalid inputs', () => {
      expect(normalizeRedirectPath('')).toBe('/');
      expect(normalizeRedirectPath(null as any)).toBe('/');
      expect(normalizeRedirectPath(undefined as any)).toBe('/');
    });
  });

  describe('extractQueryString()', () => {
    it('should extract query string correctly', () => {
      expect(extractQueryString('/tin-tuc?ref=facebook&utm=123')).toBe('?ref=facebook&utm=123');
      expect(extractQueryString('/tin-tuc')).toBe('');
      expect(extractQueryString('')).toBe('');
    });
  });

  describe('resolveRedirectChain()', () => {
    it('should return hasRedirect: false when no redirect rule exists', async () => {
      const lookupFn = () => null;
      const result = await resolveRedirectChain('/tin-tuc/bai-viet-moi', lookupFn);

      expect(result.hasRedirect).toBe(false);
      expect(result.destinationPath).toBeNull();
      expect(result.hopCount).toBe(0);
      expect(result.isLoopDetected).toBe(false);
    });

    it('should resolve a single 1-hop redirect (A -> B)', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/tin-tuc/slug-cu': { newPath: '/tin-tuc/slug-moi', statusCode: 301 },
      };

      const result = await resolveRedirectChain('/tin-tuc/slug-cu', (path) => redirectRules[path]);

      expect(result.hasRedirect).toBe(true);
      expect(result.destinationPath).toBe('/tin-tuc/slug-moi');
      expect(result.statusCode).toBe(301);
      expect(result.hopCount).toBe(1);
      expect(result.isLoopDetected).toBe(false);
      expect(result.pathChain).toEqual(['/tin-tuc/slug-cu', '/tin-tuc/slug-moi']);
    });

    it('should resolve a 2-hop chain directly to final destination (A -> B -> C)', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/xe/santafe-2024': { newPath: '/xe/santafe-2025', statusCode: 301 },
        '/xe/santafe-2025': { newPath: '/xe/santafe-2026', statusCode: 301 },
      };

      const result = await resolveRedirectChain('/xe/santafe-2024', (path) => redirectRules[path]);

      expect(result.hasRedirect).toBe(true);
      expect(result.destinationPath).toBe('/xe/santafe-2026');
      expect(result.hopCount).toBe(2);
      expect(result.isLoopDetected).toBe(false);
      expect(result.pathChain).toEqual(['/xe/santafe-2024', '/xe/santafe-2025', '/xe/santafe-2026']);
    });

    it('should cap chain at maxHops (default 3) when chain is excessively deep', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/a': { newPath: '/b' },
        '/b': { newPath: '/c' },
        '/c': { newPath: '/d' },
        '/d': { newPath: '/e' },
        '/e': { newPath: '/f' },
      };

      const result = await resolveRedirectChain('/a', (path) => redirectRules[path], { maxHops: 3 });

      expect(result.hasRedirect).toBe(true);
      expect(result.destinationPath).toBe('/d');
      expect(result.hopCount).toBe(3);
      expect(result.isLoopDetected).toBe(false);
    });

    it('should detect direct self-redirect loop (A -> A) and prevent infinite loop', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/tin-tuc/loop': { newPath: '/tin-tuc/loop' },
      };

      const result = await resolveRedirectChain('/tin-tuc/loop', (path) => redirectRules[path]);

      expect(result.hasRedirect).toBe(false);
      expect(result.isLoopDetected).toBe(true);
      expect(result.destinationPath).toBeNull();
    });

    it('should detect mutual cyclic loop (A -> B -> A) and abort safely', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/tin-tuc/a': { newPath: '/tin-tuc/b' },
        '/tin-tuc/b': { newPath: '/tin-tuc/a' },
      };

      const result = await resolveRedirectChain('/tin-tuc/a', (path) => redirectRules[path]);

      expect(result.hasRedirect).toBe(false);
      expect(result.isLoopDetected).toBe(true);
      expect(result.destinationPath).toBeNull();
      expect(result.pathChain).toEqual(['/tin-tuc/a', '/tin-tuc/b', '/tin-tuc/a']);
    });

    it('should preserve query parameters during redirect', async () => {
      const redirectRules: Record<string, RedirectLookupItem> = {
        '/khuyen-mai-thang-3': { newPath: '/tin-tuc/khuyen-mai-thang-3-vinh' },
      };

      const result = await resolveRedirectChain(
        '/khuyen-mai-thang-3?utm_source=facebook&utm_campaign=sale&page=2',
        (path) => redirectRules[path]
      );

      expect(result.hasRedirect).toBe(true);
      expect(result.destinationPath).toBe('/tin-tuc/khuyen-mai-thang-3-vinh?utm_source=facebook&utm_campaign=sale&page=2');
    });

    it('should support async lookup functions (e.g. database/API queries)', async () => {
      const asyncLookup = async (path: string) => {
        await new Promise((r) => setTimeout(r, 5));
        if (path === '/old-link') {
          return { newPath: '/new-link', statusCode: 308 };
        }
        return null;
      };

      const result = await resolveRedirectChain('/old-link', asyncLookup);

      expect(result.hasRedirect).toBe(true);
      expect(result.destinationPath).toBe('/new-link');
      expect(result.statusCode).toBe(308);
    });
  });
});
