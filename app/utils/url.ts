export function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }

  if (pathname === '/') {
    return '/';
  }

  const ensuredLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return ensuredLeadingSlash.replace(/\/+$/u, '') || '/';
}

export function buildCanonicalUrl(pathname: string, baseUrl: string) {
  const normalizedPathname = normalizePathname(pathname);
  return new URL(normalizedPathname, baseUrl).toString();
}
