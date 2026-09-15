import Header from "@/components/Header";
import Footer from "@/components/Footer";

import "@/styles/reset.css";
import "./globals.css";

export const metadata = {
  title: {
    default: "Drama Archive",
    template: "%s | powered by Next.js",
  },
  description: "海外ドラマのレビューをまとめた個人アーカイブ",
  keywords: ["海外ドラマ", "ドラマレビュー", "Drama Archive"],
};

export default function RootLayout({ children }) {
  return (
    <html>
      <Header />
      <body>{children}</body>
      <Footer />
    </html>
  );
}
