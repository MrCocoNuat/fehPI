import { Html, Head, Main, NextScript } from 'next/document'
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"></link>
      </Head>
      <body>
        <Main />
        <NextScript />
        <SpeedInsights  />
      </body>
    </Html>
  )
}
