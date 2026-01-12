import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="Shortcut Icon" href="logo.png" />
      </Head>
      <body className="bg-slate-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
