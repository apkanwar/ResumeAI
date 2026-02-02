import '@/styles/globals.css'
import { DefaultSeo } from 'next-seo'
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'en',
          siteName: 'Resume Analyzer'
        }}
      />

      <Script id="crisp">
        {`
          window.$crisp=[];window.CRISP_WEBSITE_ID="0c5c017c-d065-43b6-a15b-813ffe7f25f0";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
        `}
      </Script>
      <Component {...pageProps} />
    </main>
  )
}
