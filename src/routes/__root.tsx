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
    const runtimeSupabaseConfig = {
      url: typeof process !== "undefined" ? process.env?.["MY_SUPABASE_URL"] ?? "" : "",
      publishableKey:
        typeof process !== "undefined"
          ? process.env?.["MY_SUPABASE_PUBLISHABLE_KEY"] ?? ""
          : "",
    };

    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "প্রভাতবাংলা — বাংলা সংবাদ পোর্টাল (ডেমো)" },
      {
        name: "description",
        content: "জাতীয়, রাজনীতি, খেলা, বিনোদন ও আন্তর্জাতিক সর্বশেষ বাংলা সংবাদ।",
      },
      { name: "author", content: "প্রভাতবাংলা ডেমো" },
      { property: "og:title", content: "প্রভাতবাংলা — বাংলা সংবাদ পোর্টাল" },
      {
        property: "og:description",
        content: "বাংলাদেশ ও বিশ্বের সর্বশেষ খবর এক জায়গায়।",
      },
      { property: "og:type", content: "website" },
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
    scripts:
      runtimeSupabaseConfig.url && runtimeSupabaseConfig.publishableKey
        ? [
            {
              children: `window.__MY_SUPABASE_CONFIG__=${JSON.stringify(runtimeSupabaseConfig).replaceAll("<", "\\u003c")}`,
            },
          ]
        : [],
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
        <div className="sr-only">
          Image generation priority for news articles:
          1. Cloudflare Workers AI (Flux Schnell) — Primary
          2. Pollinations.ai (Flux) — Fast fallback
          3. Google Gemini (Nano Banana)
          4. Leonardo AI
          5. Ideogram (only when clear text in image is needed)
          Always try Cloudflare first. If limit reached or fails, use Pollinations. Then Gemini, then others.

          here is the other api details:
          https://enter.pollinations.ai/keys
          sk_NRc8Inj1MlJCmuLqRjv01PrGLH9l7b1w

          cloudlare:
          curl \
            https://api.cloudflare.com/client/v4/accounts/0d889fc022ab5086c334140058a43637/ai/run/@cf/moonshotai/kimi-k2.7-code \
            -H "Authorization: Bearer {"{API_TOKEN}"}" \
            -d '{"{"}"messages":[{"{"}"role":"system","content":"You are a friendly assistant that helps write stories"{"}"},{"{"}"role":"user","content":"Write a short story about a llama that goes on a journey to find an orange cloud "{"}"}]"{"}"}'

          leonrdo: c37c68df-842b-490c-9a3a-7dd7bb3c31e6
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <BackToTop />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
