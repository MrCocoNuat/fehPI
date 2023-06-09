import Head from 'next/head'
import Link from 'next/link'
import { RandomHeroPortraits, RandomSkillIcons } from '../components/api-explorer/RandomPortraits'
import { getUiStringResource } from '../components/ui-resources'
import { useContext } from 'react'
import { LanguageContext } from './_app'




export default function Home() {
  const selectedLanguage = useContext(LanguageContext);

  //TODO: fill in Heads for other pages
  //TODO: really basic SEO
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='flex flex-col items-center'>
        <div className='flex flex-col items-center gap-10 py-10'>
          <div className='flex flex-col items-center gap-5'>
            <p className='text-2xl text-center'>
              {getUiStringResource(selectedLanguage, "HOME_MSG1.1")}
              <Link href={'/api/graphql'} className='bg-blue-500/25 rounded-xl p-2 m-2'>
                GraphQL API
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG1.2")}
              </p> 
            <p className='text-lg'>
              {getUiStringResource(selectedLanguage, "HOME_MSG2.1")}
              <Link href={'https://the-guild.dev/graphql/yoga-server'} className='bg-blue-500/25 rounded-xl p-1 m-1'>
                GraphQL Yoga
              </Link>
              +
              <Link href={'https://pothos-graphql.dev/'} className='bg-blue-500/25 rounded-xl p-1 m-1'>
                Pothos GraphQL
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG2.2")}
            </p>

            <p className='text-lg'>
              {getUiStringResource(selectedLanguage, "HOME_MSG3.1")}
              <Link href={'https://github.com/HertzDevil/feh-assets-json'} className='bg-blue-500/25 rounded-xl p-1 m-1'>
                feh-assets-json
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG3.2")}
            </p>
          </div>

          <div className='flex flex-col gap-5 items-center self-stretch'>
            <p className='text-xl'>
              {getUiStringResource(selectedLanguage, "HOME_MSG4.1")}
            </p>
            <div className='flex flex-row gap-2 self-stretch'>
              <Link href={'explorer/hero'} className='grow'>
                <div className='bg-blue-500/25 rounded-xl flex flex-col items-center'>
                  <p className='text-2xl'>{getUiStringResource(selectedLanguage, "HOME_HEROES")}</p>
                  <RandomHeroPortraits />
                </div>
              </Link>
              <Link href={'explorer/skill'} className='grow'>
                <div className='bg-blue-500/25 rounded-xl flex flex-col items-center'>
                  <p className='text-2xl'>{getUiStringResource(selectedLanguage, "HOME_SKILLS")}</p>
                  <RandomSkillIcons />
                </div>
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

//TODO: fulfill terms of AGPL, prominently feature source