import { createCookieSessionStorage } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import config from '~/config.json';
import { buildCanonicalUrl } from '~/utils/url';
import type { PortfolioContext } from '~/types/context';

interface RootLoaderData {
  readonly canonicalUrl: string;
  readonly theme: string;
}

export const loader = async ({ request, context }: LoaderFunctionArgs<PortfolioContext>) => {
  const { url } = request;
  const { pathname } = new URL(url);
  const canonicalUrl = buildCanonicalUrl(pathname, config.url);

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 604_800,
      path: '/',
      sameSite: 'lax',
      secrets: [context.cloudflare.env.SESSION_SECRET ?? ' '],
      secure: true,
    },
  });

  const session = await getSession(request.headers.get('Cookie'));
  const theme = (session.get('theme') as string | undefined) ?? 'dark';

  return Response.json<RootLoaderData>(
    { canonicalUrl, theme },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
};
