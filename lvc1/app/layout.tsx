import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Liberty Vault Capital | Your Wealth. Your Liberty.",
  description: "Explore physical gold, silver, and Gold IRA diversification with the Liberty Vault Capital Sovereign Wealth Guide.",
  icons: { icon: "/brand/lv-logo-crest.png" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
