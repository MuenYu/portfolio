import { createCookieSessionStorage } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import {
  isThemePreference,
  type CloudflareContext,
  type SetThemeActionData,
  type ThemePreference,
} from '~/types/routes';

type SetThemeActionArgs = ActionFunctionArgs & { context: CloudflareContext };

export async function action({ request, context }: SetThemeActionArgs) {
  const formData = await request.formData();
  const submittedTheme = formData.get('theme');

  if (!isThemePreference(submittedTheme)) {
    return new Response('Invalid theme preference', { status: 400 });
  }

  const theme: ThemePreference = submittedTheme;

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
  session.set('theme', theme);

  const payload = { status: 'success' } satisfies SetThemeActionData;

  return Response.json(
    payload,
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}
