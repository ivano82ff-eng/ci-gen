export interface ErrorReporter {
  report(error: Error, context: { readonly correlationId: string }): void;
}
