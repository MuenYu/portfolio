import { createCookieSessionStorage } from 'react-router';
import config from '~/config';
import { buildCanonicalUrl } from '~/utils/url';

export const loader = async ({ request, context }) => {
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
      secrets: [context.cloudflare.env.SESSION_SECRET || ' '],
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
