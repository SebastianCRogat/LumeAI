import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Lume — Market Research Engine",
  description: "AI-powered market research for entrepreneurs and businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
