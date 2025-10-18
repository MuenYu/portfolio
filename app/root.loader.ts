import type { LoaderFunctionArgs } from 'react-router';
import { createCookieSessionStorage } from 'react-router';
import config from '~/config.json';
import { buildCanonicalUrl } from '~/utils/url';

type CloudflareContext = {
  cloudflare: {
    env: {
      SESSION_SECRET?: string;
    };
  };
};

type LoaderArgs = LoaderFunctionArgs & { context: CloudflareContext };

export const loader = async ({ request, context }: LoaderArgs) => {
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
  const theme = session.get('theme') || 'dark';

  return Response.json(
    { canonicalUrl, theme },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
};
