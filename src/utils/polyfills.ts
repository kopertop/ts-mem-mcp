/**
 * Polyfills for web APIs needed by the transformers library
 */
import nodeFetch from 'node-fetch';

// Required Web API polyfills for Node.js environment
export function setupPolyfills() {
  // Headers polyfill
  if (typeof globalThis.Headers === 'undefined') {
    class Headers {
      private headers: Map<string, string>;

      constructor(init?: Record<string, string> | [string, string][]) {
        this.headers = new Map();
        if (init) {
          if (Array.isArray(init)) {
            init.forEach(([key, value]) => this.set(key, value));
          } else {
            Object.entries(init).forEach(([key, value]) => this.set(key, value));
          }
        }
      }

      append(name: string, value: string): void {
        const existingValue = this.get(name);
        if (existingValue) {
          this.set(name, `${existingValue}, ${value}`);
        } else {
          this.set(name, value);
        }
      }

      delete(name: string): void {
        this.headers.delete(name.toLowerCase());
      }

      get(name: string): string | null {
        return this.headers.get(name.toLowerCase()) || null;
      }

      has(name: string): boolean {
        return this.headers.has(name.toLowerCase());
      }

      set(name: string, value: string): void {
        this.headers.set(name.toLowerCase(), value);
      }

      forEach(callback: (value: string, key: string) => void): void {
        this.headers.forEach((value, key) => callback(value, key));
      }
    }

    // Add Headers to the global scope
    globalThis.Headers = Headers as any;
  }

  // Request polyfill
  if (typeof globalThis.Request === 'undefined') {
    class Request {
      method: string;
      url: string;
      headers: any;

      constructor(url: string, options: any = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.headers = new (globalThis.Headers as any)(options.headers);
      }
    }

    // Add Request to the global scope
    globalThis.Request = Request as any;
  }

  // Response polyfill
  if (typeof globalThis.Response === 'undefined') {
    class Response {
      status: number;
      statusText: string;
      headers: any;
      private body: any;

      constructor(body: any, options: any = {}) {
        this.body = body;
        this.status = options.status || 200;
        this.statusText = options.statusText || '';
        this.headers = new (globalThis.Headers as any)(options.headers);
      }

      async text(): Promise<string> {
        return this.body?.toString() || '';
      }

      async json(): Promise<any> {
        const text = await this.text();
        return JSON.parse(text);
      }
    }

    // Add Response to the global scope
    globalThis.Response = Response as any;
  }

  // Fetch polyfill (basic implementation)
  if (typeof globalThis.fetch === 'undefined') {
    globalThis.fetch = nodeFetch as any;
  }

  console.log('Web API polyfills have been set up');
}