import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Digital Scanner Reimbursement Program | Next Dental Lab",
  description:
    "Go digital, on us. Next Dental Lab reimburses you for ANY 3D intraoral scanner. Fill out the form to see how you qualify.",
  openGraph: {
    title: "Digital Scanner Reimbursement Program | Next Dental Lab",
    description:
      "Go digital, on us. Next Dental Lab reimburses you for ANY 3D intraoral scanner.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="mega-site-id"
          content="2156b6c2-f46e-4c08-9fa5-62a21ad19759"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.MEGA_TAG_CONFIG = {
                siteId: "2156b6c2-f46e-4c08-9fa5-62a21ad19759",
                siteKey: "sk_5deoi877_w44rzjy472",
                gtmId: "GTM-T4N82VR8"
              };
              window.API_ENDPOINT = "https://analytics.gomega.ai";
              window.TRACKING_API_ENDPOINT = "https://events-api.gomega.ai";
            `,
          }}
        />
        <script
          src="https://cdn.gomega.ai/scripts/optimizer.min.js"
          data-site-id="2156b6c2-f46e-4c08-9fa5-62a21ad19759"
          async
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T4N82VR8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}

        {/* GTM script */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T4N82VR8');`}
        </Script>

        {/* CTM universal script */}
        <Script
          src="https://572388.tctm.co/t.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
