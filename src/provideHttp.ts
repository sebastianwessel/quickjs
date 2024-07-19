import type { IFs } from 'memfs'
import { getDefaultFetchAdapter } from './adapter/fetch.js'
import type { Arena } from './sync/index.js'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

/**
 * Provide http related functions
 */
export const provideHttp = (arena: Arena, options: RuntimeOptions, input?: { fs?: IFs | undefined }) => {
	const injectUnsupported =
		<T = any>(name: string) =>
		() => {
			throw new Error(
				`Not supported: ${name} has been disabled for security reasons or is not supported by the runtime`,
			) as T
		}

	let fetchFunction: typeof fetch = injectUnsupported('fetch')

	if (options.allowFetch) {
		fetchFunction = options.fetchAdapter ? options.fetchAdapter : getDefaultFetchAdapter({ fs: input?.fs })
	}

	arena.expose({
		__parseURL: (input: string | URL, base?: string | URL | undefined) => {
			const url = new URL(input, base)
			return {
				href: url.href,
				origin: url.origin,
				protocol: url.protocol,
				username: url.username,
				password: url.password,
				host: url.host,
				hostname: url.hostname,
				port: url.port,
				pathname: url.pathname,
				hash: url.hash,
				search: url.search,
			}
		},
		fetch: fetchFunction,
		Response,
		Request,
	})

	arena.evalCode(`class URL {
    constructor(url, base) {
      const parser = __parseURL(url,base)
      this.href = parser.href;
      this.protocol = parser.protocol;
      this.host = parser.host;
      this.hostname = parser.hostname;
      this.port = parser.port;
      this.pathname = parser.pathname;
      this.search = parser.search;
      this.searchParams = new URLSearchParams(parser.search)
      this.hash = parser.hash;
      this.username = parser.username;
      this.password = parser.password;
      this.origin = parser.protocol+'//'+parser.host;
    }

    toString() {
      return this.href;
    }

    toJSON() {
      return this.href;
    }
  }

  globalThis.URL = URL;


  class URLSearchParams {
    constructor(init = '') {
      this.params = {};

      if (typeof init === 'string') {
        this._parseFromString(init);
      } else if (init instanceof URLSearchParams) {
        init.forEach((value, key) => this.append(key, value));
      } else if (typeof init === 'object') {
        Object.keys(init).forEach(key => this.append(key, init[key]));
      }
    }

    _parseFromString(query) {
      if (query.startsWith('?')) {
        query = query.slice(1);
      }
      query.split('&').forEach(pair => {
        const [key, value] = pair.split('=').map(decodeURIComponent);
        this.append(key, value);
      });
    }

    append(key, value) {
      if (!this.params[key]) {
        this.params[key] = [];
      }
      this.params[key].push(value);
    }

    delete(key) {
      delete this.params[key];
    }

    get(key) {
      return this.params[key] ? this.params[key][0] : null;
    }

    getAll(key) {
      return this.params[key] || [];
    }

    has(key) {
      return this.params.hasOwnProperty(key);
    }

    set(key, value) {
      this.params[key] = [value];
    }

    toString() {
      return Object.keys(this.params)
        .map(key => this.params[key]
          .map(value => encodeURIComponent(key)+'='+encodeURIComponent(value))
          .join('&'))
        .join('&');
    }

    forEach(callback, thisArg) {
      Object.keys(this.params).forEach(key => {
        this.params[key].forEach(value => {
          callback.call(thisArg, value, key, this);
        });
      });
    }
  }

  globalThis.URLSearchParams = URLSearchParams;
    
  `)
}
