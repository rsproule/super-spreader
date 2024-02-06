export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("root")
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
