import "@fortawesome/fontawesome-free/css/all.min.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "../index.css";
import Providers from "./providers.next";

export const metadata = {
  title: "H-Phsar",
  description: "H-Phsar platform for distributor and retailer operations.",
};

export default function RootLayout({ children }) {
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
