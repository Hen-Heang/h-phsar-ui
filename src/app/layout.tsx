import "@fortawesome/fontawesome-free/css/all.min.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "../index.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "./providers";

export const metadata = {
  title: "H-Phsar Commerce",
  description:
    "H-Phsar Commerce platform for supplier and buyer operations.",
};

// The whole app is auth-gated client-side (localStorage) and Redux-backed —
// there is no server-renderable page today, so static prerendering only
// produces broken builds. Revisit once server-aware auth/layouts exist.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
