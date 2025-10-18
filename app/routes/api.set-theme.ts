import { createCookieSessionStorage } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import type { PortfolioContext } from '~/types/context';

interface ThemeActionData {
  readonly status: 'success';
}

export async function action({ request, context }: ActionFunctionArgs<PortfolioContext>) {
  const formData = await request.formData();
  const themeValue = formData.get('theme');

  if (typeof themeValue !== 'string') {
    return Response.json({ status: 'success' } satisfies ThemeActionData);
  }

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
  session.set('theme', themeValue);

  return Response.json<ThemeActionData>(
    { status: 'success' },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}
