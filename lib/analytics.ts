type PlausibleEvent =
  | "calculator_completed"
  | "gap_viewed"
  | "email_captured"
  | "upgrade_clicked"
  | "purchase_completed"
  | "pdf_downloaded";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function trackEvent(
  event: PlausibleEvent,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(event, props ? { props } : undefined);
  }
}
