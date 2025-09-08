import '@/styles/globals.css'
import { DefaultSeo } from 'next-seo'

export default function App({ Component, pageProps }) {
  return (
    <main>
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'en',
          siteName: 'Resume Analyzer'
        }}
      />
      <Component {...pageProps} />
    </main>
  )
}