// Errors caught by the root boundary. Production React does not rethrow these to
// window.onerror, so log them here; swap in a real error tracker when one exists.
export function logError(error: unknown, context: Record<string, unknown> = {}) {
  // Loaders and server fns commonly throw a raw Response; String(it) is the
  // opaque "[object Response]", so pull out the status and URL instead.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  console.error("[Dearkin] Unhandled error:", message, {
    ...(typeof window !== "undefined" && { route: window.location.pathname }),
    ...context,
    error,
  });
}
