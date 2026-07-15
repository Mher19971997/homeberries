"use client";

import { usePathname } from "next/navigation";
import Providers from "@homeberris/app/providers";
import Navbar from "@homeberris/layouts/Navbar";
import Footer from "@homeberris/layouts/Footer";
import NotFoundContent from "./not-found-content";
import { Suspense } from "react";

export default function NotFoundWrapper() {
  const pathname = usePathname();
  const locale =
    ["en", "ru", "hy"].find((l) => pathname?.startsWith(`/${l}`)) ?? "en";

  return (
    <Providers locale={locale}>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <NotFoundContent />
      <Footer />
    </Providers>
  );
}
