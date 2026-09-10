import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "../styles.css";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BackToTop } from "../components/back-to-top";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "bingbot", content: "index, follow" },
      { name: "theme-color", content: "#ED1C24" },
      { title: "প্রভাতবাংলা — সর্বশেষ সংবাদ" },
      {
        name: "description",
        content: "জাতীয়, রাজনীতি, খেলা, বিনোদন ও আন্তর্জাতিক সর্বশেষ বাংলা সংবাদ। সত্য ও নির্ভরযোগ্য সংবাদ সবার আগে প্রভাতবাংলায়।",
      },
      { name: "author", content: "প্রভাতবাংলা" },
      { property: "og:title", content: "প্রভাতবাংলা — বাংলা সংবাদ পোর্টাল" },
      {
        property: "og:description",
        content: "বাংলাদেশ ও বিশ্বের সর্বশেষ খবর এক জায়গায়।",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "bn_BD" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      ...(import.meta.env.PROD ? [{ rel: "stylesheet", href: appCss }] : []),
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/liam-curtis/solaimanlipi@master/solaimanlipi.css",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png?v=4" },
      { rel: "apple-touch-icon", href: "/favicon.png?v=4" },
    ],
    scripts: [
      {
        // Must run before anything renders: stop the browser from restoring a
        // stale mid-page scroll offset on reload / first visit.
        children: `
          if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
          window.scrollTo(0, 0);
        `,
      },
      {
        children: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'bn',
              includedLanguages: 'en,bn',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
          }

          // Force translation if hash is present on load
          window.addEventListener('load', function() {
            if (window.location.hash.includes('googtrans(bn|en)')) {
               // The widget handles the hash automatically usually, 
               // but we ensure it's triggered.
            }
          });
        `
      },
      {
        src: "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",
        async: true
      },
    ],
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Reloads should begin at the top instead of a restored mid-page offset,
  // and every in-app navigation should also land at the top of the new page.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Sections stream in asynchronously after hydration; a restored scroll
    // offset applied before they render lands the user mid-page. Keep the
    // page pinned to the top until the full load completes.
    const pinToTop = () => window.scrollTo(0, 0);
    if (document.readyState !== "complete") {
      window.addEventListener("load", pinToTop);
    }
    const pinInterval = window.setInterval(() => {
      if (document.readyState === "complete") {
        window.clearInterval(pinInterval);
        return;
      }
      window.scrollTo(0, 0);
    }, 150);

    let lastPath = window.location.pathname + window.location.search;
    const unsubscribe = router.subscribe("onResolved", () => {
      const next = window.location.pathname + window.location.search;
      if (next !== lastPath) {
        lastPath = next;
        window.scrollTo(0, 0);
      }
    });
    return () => {
      unsubscribe();
      window.removeEventListener("load", pinToTop);
      window.clearInterval(pinInterval);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <BackToTop />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
