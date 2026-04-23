import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campus_Ops — College Platform" },
      { name: "description", content: "Retro blueprint college platform: food, rides, medical, notes." },
      { property: "og:title", content: "Campus_Ops — College Platform" },
      { name: "twitter:title", content: "Campus_Ops — College Platform" },
      { property: "og:description", content: "Retro blueprint college platform: food, rides, medical, notes." },
      { name: "twitter:description", content: "Retro blueprint college platform: food, rides, medical, notes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fb1f5121-6898-4cbe-a3ac-fbba66b7e6f3/id-preview-8cb08386--d780f8bf-b989-4870-a878-bb058c70b401.lovable.app-1776938464308.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fb1f5121-6898-4cbe-a3ac-fbba66b7e6f3/id-preview-8cb08386--d780f8bf-b989-4870-a878-bb058c70b401.lovable.app-1776938464308.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-right" toastOptions={{ className: "!font-mono !border-4 !border-[var(--ink)] !rounded-none !shadow-[6px_6px_0_0_var(--ink)]" }} />
    </AuthProvider>
  );
}
