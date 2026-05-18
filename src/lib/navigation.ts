export function isActivePath({
  pathname,
  href,
  exact,
}: {
  pathname: string;
  href: string;
  exact?: boolean;
}) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
