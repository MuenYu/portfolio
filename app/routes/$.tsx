import { useRouteError } from 'react-router';
import { Error } from '~/layouts/error';

export function loader() {
  throw (new Response(null, { status: 404, statusText: 'Not found' }) as unknown as Error);
}

export const meta = () => {
  return [{ title: '404 | Redacted' }];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return <Error error={error} />;
}
