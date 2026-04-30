import Clarity from "@microsoft/clarity";
import * as gtag from "./gtag";

const CLARITY_PROJECT_ID = "w99ronz0em";
const VISITOR_ID_KEY = "clarity_visitor_id";

type EventParams = Record<string, string | number | boolean>;

// Defer analytics work off the click critical path so it doesn't block
// the next paint and inflate INP. requestIdleCallback runs the work when
// the main thread is free; setTimeout is the fallback for Safari.
function defer(fn: () => void): void {
  if (typeof window === "undefined") return;
  const run = () => {
    try { fn(); } catch { /* analytics must never break UX */ }
  };
  const ric = (window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof ric === "function") {
    ric(run, { timeout: 2000 });
  } else {
    setTimeout(run, 0);
  }
}

function generateVisitorId(): string {
  return "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function initClarity(): void {
  Clarity.init(CLARITY_PROJECT_ID);
  const visitorId = getVisitorId();
  if (visitorId) {
    Clarity.identify(visitorId);
  }
  if (typeof document !== "undefined" && document.referrer) {
    Clarity.setTag("referrer", document.referrer);
  }
}

export function trackPageView(pageName: string): void {
  defer(() => {
    Clarity.setTag("page", pageName);
    gtag.pageview(pageName);
  });
}

export function trackEvent(name: string, params?: EventParams): void {
  defer(() => {
    Clarity.event(name);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        Clarity.setTag(key, String(value));
      }
    }
    gtag.event(name, params);
  });
}

export function setTag(key: string, value: string | string[]): void {
  defer(() => Clarity.setTag(key, value));
}

export function upgradeSession(reason: string): void {
  defer(() => Clarity.upgrade(reason));
}
