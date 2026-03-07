import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Lume — Market Research Engine",
  description: "AI-powered market research for entrepreneurs and businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
