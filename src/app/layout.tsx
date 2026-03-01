import "./globals.css";
import { AuthProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        {/* 위는 오른쪽과 같은 원리 <AuthProvider children={children} /> */}
      </body>
    </html>
  );
}
