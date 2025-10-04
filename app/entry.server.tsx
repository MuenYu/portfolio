import { renderToReadableStream } from 'react-dom/server';
import { isbot } from 'isbot';
import { ServerRouter } from 'react-router';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext
) {
  const userAgent = request.headers.get('user-agent');
  const isBotRequest = userAgent ? isbot(userAgent) : false;

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        responseStatusCode = 500;
        console.error(error);
      },
    }
  );

  if (isBotRequest || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
