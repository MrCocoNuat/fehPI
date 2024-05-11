import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head"
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '../components/api-fragments'
import { ThemeProvider } from 'next-themes'
import { createContext, useEffect } from 'react'
import { LANGUAGE_CODES, Language } from './api/dao/types/dao-types'
import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { getUiStringResource } from '../components/ui-resources'

export const LOCAL_STORAGE_LANGUAGE_KEY = "lang";
export const LanguageContext = createContext(Language.USEN);

export default function App({ Component, pageProps }: AppProps) {
  const [currentLanguage, updateCurrentLanguage] = useState(Language.USEN); // yeah yeah US defaultism... 
  useEffect(() => {
    const langData = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY);
    if (langData){
      const language = JSON.parse(langData) as Language;
      document.documentElement.lang = LANGUAGE_CODES[language];
      updateCurrentLanguage(language);
    }
  }, [currentLanguage]);

  return <>
    <LanguageContext.Provider value={currentLanguage}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={getUiStringResource(currentLanguage, "HOME_MSG1.1") + " GraphQL API " + getUiStringResource(currentLanguage, "HOME_MSG1.2")} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopBar currentLanguage={currentLanguage} updateCurrentLanguage={(lang) => {
        localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, JSON.stringify(lang));
        updateCurrentLanguage(lang);
      }} />
      
      <ApolloProvider client={apolloClient}>
        <ThemeProvider attribute='class'>
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </LanguageContext.Provider>
  </>
}
