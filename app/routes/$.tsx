import { useRouteError } from 'react-router';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { Error } from '~/layouts/error';

export async function loader({}: LoaderFunctionArgs) {
  throw new Response(null, { status: 404, statusText: 'Not found' });
}

export const meta: MetaFunction = () => {
  return [{ title: '404 | Redacted' }];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return <Error error={error} />;
}
