import type { ErrorReporter } from '../../application/ports/error-reporter.js';

interface ParsedDsn {
  readonly protocol: string;
  readonly publicKey: string;
  readonly host: string;
  readonly projectId: string;
}

export class SentryErrorReporter implements ErrorReporter {
  constructor(
    private readonly dsn: string | undefined,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  report(error: Error, context: { readonly correlationId: string }): void {
    const parsed = this.parseDsn(this.dsn);
    if (!parsed) return;

    const url = `${parsed.protocol}//${parsed.host}/api/${parsed.projectId}/store/`;
    void this.fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=ci-gen/1.0.0, sentry_key=${parsed.publicKey}`,
      },
      body: JSON.stringify({
        message: error.message,
        level: 'error',
        logger: 'ci-gen',
        tags: { correlation_id: context.correlationId },
        extra: { correlationId: context.correlationId },
        exception: {
          values: [{ type: error.name, value: error.message }],
        },
      }),
    }).catch(() => undefined);
  }

  private parseDsn(dsn: string | undefined): ParsedDsn | undefined {
    if (!dsn) return undefined;
    try {
      const url = new URL(dsn);
      const publicKey = url.username;
      const projectId = url.pathname.replace(/^\//, '');
      if (!publicKey || !projectId) return undefined;
      return {
        protocol: url.protocol,
        publicKey,
        host: url.host,
        projectId,
      };
    } catch {
      return undefined;
    }
  }
}
