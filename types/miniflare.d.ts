export type Awaitable<T> = Promise<T> | T;

export interface DispatchFetch {
  (request: Request): Promise<Response>;
}

export interface MiniflareOptions {
  script?: string;
  modules?: Array<{ type: string; path: string }>;
  compatibilityDate?: string;
  compatibilityFlags?: string[];
}

export interface WorkerRegistry {}

export interface WorkerOptions {
  name?: string;
  script?: string;
}

export interface ModuleRule {}

export interface RemoteProxyConnectionString {}

export interface Mutex<T = unknown> {
  acquire(): Promise<T>;
  runWith<TValue>(value: TValue, callback: () => Promise<unknown>): Promise<void>;
}

export class Miniflare {
  constructor(options?: MiniflareOptions);
  startServer(): Promise<{ stop(): Promise<void> }>;
  dispose(): Promise<void>;
  getWorker(): Promise<MiniflareWorker>;
}

export interface NodeJSCompatMode {}

export interface MiniflareWorker {
  fetch: DispatchFetch;
  scheduled?: (controller: import('@cloudflare/workers-types').ScheduledController) => Awaitable<void>;
  queue?: (batch: unknown) => Awaitable<void>;
}

export interface Json {
  [key: string]: unknown;
}

export interface Request<T = unknown> extends globalThis.Request {
  cf?: T;
}

export interface Request_2<T> extends Request {
  cf?: T;
}

export interface Response_2 extends Response {}

export type Response = globalThis.Response;
export type RequestInfo = globalThis.RequestInfo;
export type RequestInit = globalThis.RequestInit;

export { Response as Response$1 };

export interface DurableObjectNamespace {}

export interface QueueBroker {}

export interface R2Bucket {}

export interface AnalyticsEngine {}

export interface WorkerContextBinding {}

export interface MiniflareContext {}

export interface WorkerEnvironment {}

export interface RunnerOptions {}

export interface MiniflareOptionsAndDefaults extends MiniflareOptions {}

export interface StringMap {
  [key: string]: string;
}

export default Miniflare;
