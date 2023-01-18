import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head"
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '../components/api-fragments'
import { ThemeProvider } from 'next-themes'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <ApolloProvider client={apolloClient}>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  </>
}
