import Head from 'next/head'
import Link from 'next/link'
import { RandomHeroPortraits, RandomSkillIcons } from '../components/api-explorer/Portraits'
import { DEFAULT_LANGUAGE, getUiStringResource, githubLogo, logo } from '../components/ui-resources'
import { useContext } from 'react'
import { LanguageContext } from './_app'




export default function Home() {
  const selectedLanguage = useContext(LanguageContext);

  return (
    <>
      <Head>
        <title>{getUiStringResource(selectedLanguage, "TITLE_ROOT")}</title>
      </Head>
      <main className='flex flex-col items-center'>
        <div className='flex flex-col items-center gap-10 py-10'>
          <div className='flex flex-col items-center gap-5'>
            <div className='relative w-24 aspect-square'>
              {logo()}
            </div>
            <p className='text-2xl text-center'>
              {getUiStringResource(selectedLanguage, "HOME_MSG1.1")}
              <Link href={'/api/graphql'} className='bg-blue-700/25 rounded-xl p-2 m-2'>
                GraphQL API
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG1.2")}
            </p>
            <p className='text-lg'>
              {getUiStringResource(selectedLanguage, "HOME_MSG2.1")}
              <Link href={'https://the-guild.dev/graphql/yoga-server'} className='bg-blue-700/25 rounded-xl p-1 m-1'>
                GraphQL Yoga
              </Link>
              +
              <Link href={'https://pothos-graphql.dev/'} className='bg-blue-700/25 rounded-xl p-1 m-1'>
                Pothos GraphQL
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG2.2")}
            </p>

            <p className='text-lg'>
              {getUiStringResource(selectedLanguage, "HOME_MSG3.1")}
              <Link href={'https://github.com/HertzDevil/feh-assets-json'} className='bg-blue-700/25 rounded-xl p-1 m-1'>
                feh-assets-json
              </Link>
              {getUiStringResource(selectedLanguage, "HOME_MSG3.2")}
            </p>
          </div>

          <div className='flex flex-col gap-5 items-center self-stretch'>
            <p className='text-xl'>
              {getUiStringResource(selectedLanguage, "HOME_MSG4.1")}
            </p>
            <div className='flex flex-col sm:flex-row gap-2 sm:self-stretch'>
              <div className='grow'>
                <div className='bg-blue-700/25 rounded-xl flex flex-col items-center'>
                  <p className='text-2xl'>{getUiStringResource(selectedLanguage, "HOME_HEROES")}</p>
                  <RandomHeroPortraits />
                </div>
              </div>
              <div className='grow'>
                <div className='bg-blue-700/25 rounded-xl flex flex-col items-center'>
                  <p className='text-2xl'>{getUiStringResource(selectedLanguage, "HOME_SKILLS")}</p>
                  <RandomSkillIcons />
                </div>
              </div>
            </div>
          </div>

        </div>
        <p>{selectedLanguage != DEFAULT_LANGUAGE && getUiStringResource(selectedLanguage, "HOME_TRANSLATION_WARNING")}</p>
        <Link href={'https://github.com/MrCocoNuat/fehPI'}>
          <div className='flex flex-row gap-1'>
            <div className='relative aspect-square w-6'>
              {githubLogo()}
            </div>
            {getUiStringResource(selectedLanguage, "HOME_FOSS")}
          </div>
        </Link>
      </main>
    </>
  )
}
