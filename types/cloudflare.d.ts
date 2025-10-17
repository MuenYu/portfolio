declare module '@cloudflare/workers-types' {
  export interface Cache {
    match(request: Request | string, options?: CacheQueryOptions): Promise<Response | undefined>;
    put(request: Request | string, response: Response): Promise<void>;
    delete(request: Request | string, options?: CacheQueryOptions): Promise<boolean>;
  }

  export interface CacheQueryOptions {
    ignoreMethod?: boolean;
    ignoreSearch?: boolean;
    cacheName?: string;
  }

  export interface CacheStorage {
    default: Cache;
    open(cacheName: string): Promise<Cache>;
    match(request: Request | string, options?: CacheQueryOptions): Promise<Response | undefined>;
  }

  export interface KVNamespace<ListValue = unknown> {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
    getWithMetadata<Value = unknown, Metadata = unknown>(
      key: string,
      options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' },
    ): Promise<{ value: Value | null; metadata: Metadata | null }>;
    put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number; metadata?: ListValue }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
      keys: Array<{ name: string; expiration?: number; metadata?: ListValue }>;
      list_complete: boolean;
      cursor?: string;
    }>;
  }

  export interface R2Object {
    key: string;
    size: number;
    etag: string;
  }

  export interface R2ObjectBody extends R2Object {
    body: ReadableStream;
  }

  export interface R2Bucket {
    get(key: string): Promise<R2ObjectBody | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | string, options?: Record<string, unknown>): Promise<R2Object | null>;
    delete(keys: string | string[]): Promise<void>;
  }

  export interface QueueMessageBatch<T = unknown> {
    messages: T[];
  }

  export interface Queue<T = unknown> {
    send(message: T): Promise<void>;
    sendBatch(batch: QueueMessageBatch<T>): Promise<void>;
  }

  export interface DurableObjectId {
    toString(): string;
  }

  export interface DurableObjectStub {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  }

  export interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    newUniqueId(): DurableObjectId;
    stub(id: DurableObjectId): DurableObjectStub;
  }

  export interface IncomingRequestCfProperties {
    [key: string]: unknown;
    asn?: number;
    colo?: string;
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
    latitude?: string;
    longitude?: string;
    postalCode?: string;
    continent?: string;
  }

  export interface ScheduledController {
    scheduledTime: number;
    cron?: string;
  }

  export interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }
}

declare module '@cloudflare/workers-types/experimental' {
  export * from '@cloudflare/workers-types';
}

declare interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

declare type KVNamespace<Value = unknown> = import('@cloudflare/workers-types').KVNamespace<Value>;

declare interface EventContext<Env = unknown, Params = Record<string, string>, Data = unknown> {
  request: Request & { cf?: import('@cloudflare/workers-types').IncomingRequestCfProperties };
  env: Env;
  params: Params;
  data: Data;
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

declare type PagesFunction<Env = unknown, Params = Record<string, string>, Data = unknown> = (
  context: EventContext<Env, Params, Data>,
) => Response | Promise<Response>;

declare interface CacheStorage {
  default: import('@cloudflare/workers-types').Cache;
  open(cacheName: string): Promise<import('@cloudflare/workers-types').Cache>;
  match(request: Request | string, options?: import('@cloudflare/workers-types').CacheQueryOptions): Promise<Response | undefined>;
}

declare interface RequestInitCfProperties {
  cacheEverything?: boolean;
  cacheTtl?: number;
  cacheKey?: string;
}
