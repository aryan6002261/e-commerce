import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/components/store-provider";

export const metadata: Metadata = {
  title: "Morrow & Co. — Good things for the everyday",
  description: "Thoughtfully chosen home goods, objects, and everyday essentials. A softer place to land.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
