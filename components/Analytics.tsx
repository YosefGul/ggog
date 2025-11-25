"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Generate a unique session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// Parse user agent
function parseUserAgent(): { browser: string; os: string } {
  if (typeof window === "undefined") return { browser: "unknown", os: "unknown" };
  
  const ua = navigator.userAgent;
  let browser = "unknown";
  let os = "unknown";

  // Browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os };
}

// Track analytics event
async function trackEvent(eventType: string, metadata?: Record<string, any>) {
  try {
    const sessionId = getSessionId();
    const deviceType = getDeviceType();
    const { browser, os } = parseUserAgent();
    const referrer = document.referrer || null;

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        page: window.location.pathname,
        referrer,
        userAgent: navigator.userAgent,
        deviceType,
        browser,
        os,
        sessionId,
        metadata,
      }),
    });
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.error("Analytics tracking error:", error);
  }
}

// Track page view with duration
let pageViewStartTime: number | null = null;
let pageViewTimer: NodeJS.Timeout | null = null;

function startPageViewTracking() {
  pageViewStartTime = Date.now();
  
  // Track page view immediately
  trackEvent("PAGE_VIEW");

  // Track duration when user leaves the page
  const handleBeforeUnload = () => {
    if (pageViewStartTime) {
      const duration = Math.floor((Date.now() - pageViewStartTime) / 1000);
      trackEvent("PAGE_VIEW", { duration });
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Also track duration after 30 seconds (for SPA navigation)
  if (pageViewTimer) {
    clearTimeout(pageViewTimer);
  }
  
  pageViewTimer = setTimeout(() => {
    if (pageViewStartTime) {
      const duration = Math.floor((Date.now() - pageViewStartTime) / 1000);
      trackEvent("PAGE_VIEW", { duration });
    }
  }, 30000);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    if (pageViewTimer) {
      clearTimeout(pageViewTimer);
    }
  };
}

// Track clicks on buttons and links
function setupClickTracking() {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Find the closest button or link
    const button = target.closest("button, a, [role='button']");
    if (!button) return;

    const buttonText = button.textContent?.trim() || "";
    const href = (button as HTMLAnchorElement).href || null;
    const buttonId = button.id || null;
    const buttonClass = button.className || null;

    trackEvent("CLICK", {
      element: button.tagName.toLowerCase(),
      text: buttonText.substring(0, 100), // Limit text length
      href: href ? new URL(href).pathname : null,
      id: buttonId,
      className: buttonClass,
    });
  };

  document.addEventListener("click", handleClick, true);
  return () => {
    document.removeEventListener("click", handleClick, true);
  };
}

// Track form submissions
function setupFormTracking() {
  const handleSubmit = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    const formId = form.id || null;
    const formAction = form.action || null;
    const formMethod = form.method || "POST";

    trackEvent("FORM_SUBMIT", {
      formId,
      formAction: formAction ? new URL(formAction, window.location.origin).pathname : null,
      formMethod,
    });
  };

  document.addEventListener("submit", handleSubmit, true);
  return () => {
    document.removeEventListener("submit", handleSubmit, true);
  };
}

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view on route change
    const cleanupPageView = startPageViewTracking();
    const cleanupClicks = setupClickTracking();
    const cleanupForms = setupFormTracking();

    return () => {
      cleanupPageView();
      cleanupClicks();
      cleanupForms();
      
      // Track duration before leaving
      if (pageViewStartTime) {
        const duration = Math.floor((Date.now() - pageViewStartTime) / 1000);
        trackEvent("PAGE_VIEW", { duration });
      }
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

