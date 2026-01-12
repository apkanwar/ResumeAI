import '@/styles/globals.css'
import { DefaultSeo } from 'next-seo'

export default function App({ Component, pageProps }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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
