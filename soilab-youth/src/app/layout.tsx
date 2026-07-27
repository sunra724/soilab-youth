import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = "G-KR3RH3S8KX";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://soilab-youth.kr"),
  title: {
    default: "협동조합 소이랩 고립·은둔 청년 지원센터",
    template: "%s | 소이랩 청년지원센터",
  },
  description:
    "대구 지역 고립·은둔 청년을 발굴하고 회복을 지원합니다. 132명의 쉼청년과 함께 걸어온 협동조합 소이랩입니다.",
  keywords: ["고립청년", "은둔청년", "청년지원", "대구청년", "소이랩", "쉼청년", "청년다다름"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://soilab-youth.kr",
    siteName: "협동조합 소이랩 고립·은둔 청년 지원센터",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
    </html>
  );
}
