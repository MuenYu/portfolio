import { renderToReadableStream } from 'react-dom/server';
import { isbot } from 'isbot';
import { ServerRouter } from 'react-router';
import type { EntryContext } from 'react-router';

type RenderStream = ReadableStream<Uint8Array> & { allReady?: Promise<void> };

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const userAgent = request.headers.get('user-agent');
  const isBotRequest = userAgent ? isbot(userAgent) : false;

  const body = (await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        responseStatusCode = 500;
        console.error(error);
      },
    }
  )) as RenderStream;

  if ((isBotRequest || routerContext.isSpaMode) && body.allReady) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
