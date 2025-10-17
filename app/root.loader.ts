import { createCookieSessionStorage } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import config from '~/config';
import { buildCanonicalUrl } from '~/utils/url';
import {
  isThemePreference,
  type CloudflareContext,
  type RootLoaderData,
  type ThemePreference,
} from '~/types/routes';

type RootLoaderArgs = LoaderFunctionArgs & { context: CloudflareContext };

export const loader = async ({ request, context }: RootLoaderArgs) => {
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
  const sessionTheme = session.get('theme');
  const theme: ThemePreference = isThemePreference(sessionTheme) ? sessionTheme : 'dark';

  const payload = { canonicalUrl, theme } satisfies RootLoaderData;

  return Response.json(
    payload,
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
};
