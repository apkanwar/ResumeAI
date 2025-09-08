import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="Shortcut Icon" href="logo.png" />
      </Head>
      <body className="bg-midnight">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
