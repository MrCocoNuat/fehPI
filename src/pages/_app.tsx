import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head"
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '../components/api'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  </>
}
