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
        <meta name="mega-site-id" content="" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}

        {/* CTM universal script */}
        <Script
          src="https://572388.tctm.co/t.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
