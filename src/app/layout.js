import "./globals.css";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL('https://careerdiary.in'),
  title: {
    default: "CAREER DIARY • GOVT JOB PORTAL | CareerDiary.in",
    template: "%s"
  },
  description: "Career Diary (careerdiary.in) - India's most trusted portal for Latest Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.",
  icons: {
    icon: "/image.png",
    apple: "/image.png",
  },
  openGraph: {
    siteName: "Career Diary",
    type: "website",
    title: "CAREER DIARY • GOVT JOB PORTAL",
    description: "Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.",
    url: "https://careerdiary.in/",
    images: [{ url: "/image.png" }],
  },
  twitter: {
    card: "summary",
    title: "CAREER DIARY • GOVT JOB PORTAL",
    description: "Latest Indian Govt Jobs, Admit Cards, Answer Keys, Results, Syllabus & Admission Notifications 2026.",
    images: ["/image.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-2108299943580613",
  }
};

export const viewport = {
  width: 1080,
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://careerdiary-f2e0a.firebaseapp.com" />
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108299943580613"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics Script */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-H3WLGYXSW0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H3WLGYXSW0');
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
