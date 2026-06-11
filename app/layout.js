import './globals.css'

export const metadata = {
  title: 'מונדיאל 2026 - ניחוש תוצאות',
  description: 'ניחשו תוצאות מונדיאל 2026 עם החברים',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
