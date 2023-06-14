import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head"
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '../components/api-fragments'
import { ThemeProvider } from 'next-themes'
import { createContext } from 'react'
import { Language } from './api/dao/types/dao-types'
import { useState } from 'react'
import { TopBar } from '../components/TopBar'

export const LanguageContext = createContext(Language.USEN);

export default function App({ Component, pageProps }: AppProps) {
  const [currentLanguage, updateCurrentLanguage] = useState(Language.USEN); // yeah yeah US defaultism... 

  return <>
    <LanguageContext.Provider value={currentLanguage}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopBar currentLanguage={currentLanguage} updateCurrentLanguage={updateCurrentLanguage} />
      
      <ApolloProvider client={apolloClient}>
        <ThemeProvider attribute='class'>
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </LanguageContext.Provider>
  </>
}
