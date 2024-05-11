import { useRouter } from "next/router";
import { INCLUDE_FRAG, PASSIVE_SKILL_IMAGE_URL, PASSIVE_SKILL_IMAGE_URL_FRAG, WEAPON_IMAGE_URL, WEAPON_IMAGE_URL_FRAG } from "../../components/api-fragments";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { MovementType, MovementTypeBitfield, OptionalLanguage, RefineType, SkillCategory, WeaponType, WeaponTypeBitfield } from "../api/dao/types/dao-types";
import { LanguageContext } from "../_app";
import { SkillDetails, SkillDetailsMini } from "../../components/api-explorer/SkillDetails";
import { BackButton } from "../../components/api-explorer/BackButton";
import { DEFAULT_LANGUAGE, getUiStringResource, githubLogo } from "../../components/ui-resources";
import Head from "next/head";
import { SkillPortrait } from "../../components/api-explorer/Portraits";
import Link from "next/link";

const GET_SKILL_DETAIL = gql`
query getSkillDetail($id: Int!, $language: OptionalLanguage!){
    skills(idNums: [$id]){
        idNum
        idTag
        name(language: $language){
            value
        }
        desc(language: $language){
            value
        }
        exclusive
        enemyOnly
        category
        weaponEquip
        movementEquip
        nextSkill{
            idNum
            name(language: $language){
                value
            }  
            ... on PassiveSkillDefinition{
                imageUrl
            }
            ... on WeaponDefinition{
                weaponImageUrl : imageUrl
                refineType
            }
        }
        prerequisites{
            idNum
            name(language: $language){
                value
            }  
            ... on PassiveSkillDefinition{
                imageUrl
            }
            ... on WeaponDefinition{
                weaponImageUrl : imageUrl
                refineType
            }
        }
        ... on PassiveSkillDefinition{
            imageUrl
        }
        ... on WeaponDefinition{
            weaponImageUrl : imageUrl
            arcaneWeapon
            refineType
            refines{
                idNum
                weaponImageUrl: imageUrl
                name(language: $language){
                    value
                }  
                refineType
            }
            refineBase{
                idNum
                weaponImageUrl: imageUrl
                name(language: $language){
                    value
                }
                refineType
            }
        }
    }
}`

const GET_ADJACENT_SKILLS = gql`
query getAdjacentSkills($ids: [Int!]!, $language: OptionalLanguage!){
    skills(idNums: $ids){
        idNum
        category
        ... on PassiveSkillDefinition{
            imageUrl   
        }
        name(language: $language){
            value
        }
    }
}
`

export type SkillQueryResult = {
    idNum: number
    idTag: string,
    name: { value: string },
    desc: { value?: string },

    prerequisites: {
        idNum: number, name: { value: string }, imageUrl?: string, weaponImageUrl?: string
    }[],
    nextSkill?: {
        idNum: number, name: { value: string }, imageUrl?: string, weaponImageUrl?: string
    },

    exclusive: boolean,
    enemyOnly: boolean,

    category: SkillCategory,
    weaponEquip: WeaponType[],
    movementEquip: MovementType[],

    imageUrl?: string,
    weaponImageUrl?: string,

    refineType?: RefineType,
    arcaneWeapon?: boolean,
    refines?: {
        idNum: number, weaponImageUrl: string, name: { value: string }, refineType: RefineType
    }[],
    refineBase?: {
        idNum: number, weaponImageUrl: string, name: { value: string }, refineType: RefineType
    },
}

const mapQuery = (data: any) => data.skills.map((responseSkill: any) => ({
    ...responseSkill,
    category: SkillCategory[responseSkill.category],
    desc: { value: responseSkill.desc?.value?.replace("\n", " ").replace(/$./g,"") },
    weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
    movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
    refineType: (responseSkill.refineType == undefined) ? undefined : RefineType[responseSkill.refineType],

    refines: (responseSkill.refines == undefined) ? undefined : responseSkill.refines.map((weapon: any) => ({
        ...weapon,
        refineType: RefineType[weapon.refineType]
    })),
    refineBase: (responseSkill.refineBase == undefined) ? undefined : [responseSkill.refineBase].map((weapon: any) => ({
        ...weapon,
        refineType: RefineType[weapon.refineType]
    }))[0],

}))[0] as SkillQueryResult;

const mapSideQuery = (data: any) => data.skills.map((responseSkill: any) => responseSkill === null? ({}) : ({
    ...responseSkill,
    category: SkillCategory[responseSkill.category],
})) as { category: SkillCategory, idNum: number, imageUrl?: string, name: { value: string } }[];

export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);
    const router = useRouter();
    const skillId = +(router.query.skillId as String);

    const { loading, error, data } = useQuery(GET_SKILL_DETAIL, { variables: { id: skillId, language: OptionalLanguage[currentLanguage] } });
    const { loading: loadingSide, error: errorSide, data: dataSide } = useQuery(GET_ADJACENT_SKILLS, { variables: { ids: [skillId - 1, skillId + 1], language: OptionalLanguage[currentLanguage] } })

    if (loading) {
        return <></>
    }
    if (error) {
        return "";
    }

    if (data.skills[0] === null){
        return <div className="flex flex-row justify-center p-2">
            <BackButton />
            <div className="bg-blue-800/25 rounded-xl p-2 gap-1">
                {getUiStringResource(currentLanguage, "HOME_NOT_FOUND")}
            </div>
        </div>
    }

    const skillQueryResult = mapQuery(data);
    const sideQueryResults = (dataSide === undefined)? undefined : mapSideQuery(dataSide);
    return <div className="flex flex-col items-center">
        <Head>
            <title>{getUiStringResource(currentLanguage, "TITLE_SKILL")}</title>
        </Head>
        <div className="flex flex-row justify-center p-2 mb-10">
            <BackButton />
            <div className="flex flex-col gap-2">
                <SkillDetails skillDetails={skillQueryResult} />
                {sideQueryResults && <div className="flex flex-row justify-between gap-2">
                    {sideQueryResults[0].idNum === undefined? <div/> : <SkillDetailsMini {...sideQueryResults[0]} /> /* div needed for flex element placement */}
                    {sideQueryResults[1].idNum === undefined? <div/> : <SkillDetailsMini {...sideQueryResults[1]} />}
                </div>}
            </div>
        </div>
        <p>{currentLanguage != DEFAULT_LANGUAGE && getUiStringResource(currentLanguage, "HOME_TRANSLATION_WARNING")}</p>
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