import { useContext } from "react";
import { LanguageContext } from "../_app";
import { useRouter } from "next/router";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { BlessingEffect, BlessingSeason, HonorType, MovementType, OptionalLanguage, Series, SeriesName, WeaponType } from "../api/dao/types/dao-types";
import { SkillQueryResult } from "../skill/[skillId]";
import { HeroDetails, HeroDetailsMini } from "../../components/api-explorer/HeroDetails";
import { BackButton } from "../../components/api-explorer/BackButton";
import Head from "next/head";
import { DEFAULT_LANGUAGE, DEFAULT_LANGUAGE_SYNONYMS, getUiStringResource, githubLogo } from "../../components/ui-resources";
import Link from "next/link";

const GET_HERO_DETAIL = gql`
    query getHeroDetail($id: Int!, $language: OptionalLanguage!){
        heroes(idNums:[$id]){
            idNum
            idTag
            movementType
            weaponType
            origins
            refresher
            honorType
            maxDragonflowers
            name(language: $language){
                value
            }
            epithet(language: $language){
                value
            }
            imageUrl
            honorType
            resplendentExists
            resplendentImageUrl
            ...on BlessedHeroDefinition{
                blessingSeason
                blessingEffect
            }
        }
    }
`

const GET_ADJACENT_HEROES = gql`
query getAdjacentHeroes($ids: [Int!]!, $language: OptionalLanguage!){
    heroes(idNums: $ids){
        idNum
        imageUrl   
        name(language: $language){
            value
        }
        epithet(language: $language){
            value
        }
    }
}
`

export type HeroQueryResult = {
    idNum: number,
    idTag: string,
    name: {value: string},
    epithet: {value: string},

    imageUrl: string,
    resplendentExists: boolean,
    resplendentImageUrl?: string,

    movementType: MovementType,
    weaponType: WeaponType,
    origins: Series[],
    honorType: HonorType,
    blessingSeason?: BlessingSeason,
    blessingEffect?: BlessingEffect,
    refresher: boolean,

    maxDragonflowers: number,

}

const mapQuery = (data: any) => data.heroes.map((responseHero: any) => ({
    ...responseHero,
    movementType: MovementType[responseHero.movementType],
    weaponType: WeaponType[responseHero.weaponType],
    origins: responseHero.origins.map((series: SeriesName) => Series[series]),
    honorType: HonorType[responseHero.honorType],
    blessingSeason: (responseHero.blessingSeason == undefined)? undefined : BlessingSeason[responseHero.blessingSeason],
    blessingEffect: (responseHero.blessingEffect == undefined)? undefined : BlessingEffect[responseHero.blessingEffect],
}))[0] as HeroQueryResult;

const mapSideQuery = (data: any) => data.heroes.map((responseHero: any) => ({
    ...responseHero
})) as {idNum: number, name: {value: string}, epithet: {value: string}, imageUrl: string}[];

export default function HeroExplorer() {
    const currentLanguage = useContext(LanguageContext);
    const router = useRouter();
    const heroId = +(router.query.heroId as String);

    const { loading, error, data } = useQuery(GET_HERO_DETAIL, { variables: { id: heroId, language: OptionalLanguage[currentLanguage] } });
    const { loading: loadingSide, error: errorSide, data: dataSide } = useQuery(GET_ADJACENT_HEROES, { variables: { ids: [heroId - 1, heroId + 1], language: OptionalLanguage[currentLanguage] } })

    if (loading) {
        return <></>
    }

    if (error || data.heroes[0] === null){
        return <div className="flex flex-row justify-center p-2">
            <BackButton />
            <div className="bg-blue-700/25 rounded-xl p-2 gap-1">
                {getUiStringResource(currentLanguage, "HOME_NOT_FOUND")}
            </div>
        </div>
    }

    const HeroQueryResult = mapQuery(data);
    const sideQueryResults = (dataSide === undefined)? undefined : mapSideQuery(dataSide);
    return<div className="flex flex-col items-center">
    <Head>
        <title>{getUiStringResource(currentLanguage, "TITLE_HERO")}</title>
    </Head>
    <div className="flex flex-row justify-center p-2 mb-16">
            <BackButton />
            <div className="flex flex-col gap-2">
                <HeroDetails heroDetails={HeroQueryResult} />
                {sideQueryResults && <div className="flex flex-row justify-between gap-2">
                    {sideQueryResults[0].idNum === undefined? <div/> : <HeroDetailsMini hero={sideQueryResults[0]} /> /* div needed to correctly place flex elements*/}
                    {sideQueryResults[1].idNum === undefined? <div/> : <HeroDetailsMini hero={sideQueryResults[1]} />}
                </div>}
            </div>
        </div>
        <p className="text-center">{ ! DEFAULT_LANGUAGE_SYNONYMS.includes(currentLanguage) && getUiStringResource(currentLanguage, "HOME_TRANSLATION_WARNING")}</p>
        <Link href={'https://github.com/MrCocoNuat/fehPI'}>
          <div className='flex flex-row gap-1'>
            <div className='relative aspect-square w-6'>
              {githubLogo()}
            </div>
            {getUiStringResource(currentLanguage, "HOME_FOSS")}
          </div>
        </Link>
    </div>
}