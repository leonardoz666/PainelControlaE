const DEFAULT_OPERATIONAL_URL = "https://frontend-c-kappa.vercel.app";

export function normalizeOperationalBaseUrl(configuredValue: string | undefined): string {
  const configured = configuredValue?.trim() || DEFAULT_OPERATIONAL_URL;
  const absolute = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  const url = new URL(absolute);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_OPERATIONAL_URL deve ser uma URL HTTP ou HTTPS válida");
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export function establishmentLoginUrl(operationalBase: string, slug: string): string {
  return new URL(`/e/${encodeURIComponent(slug)}/login`, `${operationalBase}/`).toString();
}

export function establishmentInstallationUrl(operationalBase: string, slug: string): string {
  const establishmentUrl = new URL(`/e/${encodeURIComponent(slug)}`, `${operationalBase}/`).toString();
  const activationUrl = new URL('/instalacao', `${operationalBase}/`);
  activationUrl.searchParams.set('link', establishmentUrl);
  return activationUrl.toString();
}
