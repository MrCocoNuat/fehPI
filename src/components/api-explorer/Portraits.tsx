import gql from "graphql-tag";
import { SkillCategory, SkillCategoryName } from "../../pages/api/dao/types/dao-types";
import { useQuery } from "@apollo/client";
import Image from "next/image"
import { largeSkillCategoryIcon, skillCategoryIcon } from "../ui-resources";
import { useEffect, useState } from "react";
import Link from "next/link";


// don't really matter that much, so no need to update these values
const MAX_RAND_HERO_ID = 1000;
const MAX_RAND_SKILL_ID = 3600;

const count = 4;

function nRandomInts(n: number, max: number) {
    return new Array(n).fill(0).map(() => Math.floor(Math.random() * max));
}

const HERO_PORTRAITS = gql`
    query HeroPortraits($ids: [Int!]!){
        heroes(idNums: $ids){
            idNum
            imageUrl   
        }
    }
`
const mapHeroQuery = (data: any) => data.heroes as { idNum: number, imageUrl: string }[]


const SKILL_ICONS = gql`
    query SkillIcons($ids: [Int!]!){
        skills(idNums: $ids){
            idNum
            category
            ... on PassiveSkillDefinition{
                imageUrl   
            }
        }
    }
`
// skill ids are not all consecutively defined (holes exist) so any nulls are replaced with
// a special (Galeforce) - all we need is the icon anyway, this is for show
const fakeSkill = {
    idNum: 199,
    skillCategory: SkillCategory.SPECIAL,
}
const mapSkillQuery = (data: any) => data.skills.map((responseSkill: any) =>
    responseSkill === null ?
        fakeSkill
        : ({
            ...responseSkill,
            skillCategory: SkillCategory[responseSkill.category],
        })) as { idNum: number, skillCategory: SkillCategory, imageUrl?: string }[]

export function RandomHeroPortraits() {
    const [ids, setIds] = useState(nRandomInts(count, MAX_RAND_HERO_ID));
    const { data, loading, error } = useQuery(HERO_PORTRAITS, { variables: { ids: ids } });

    if (error) {
        return <>error</>
    }
    if (loading) {
        return <>...</>
    }

    return <div className="flex flex-row justify-between self-stretch m-2">
        {mapHeroQuery(data).map((value) => <HeroPortrait {...value} key={value.idNum}/>)}
    </div>
}

export function HeroPortrait({idNum, imageUrl}: {idNum : number, imageUrl: string}){
    return <Link href={`/hero/${idNum}`} className="p-1 aspect-square relative bg-blue-500/25 rounded-xl overflow-hidden" >
            <div key={idNum} className="w-12 aspect-square relative bg-blue-500/25 rounded-xl overflow-hidden">
                <Image src={imageUrl} alt={`portrait of hero ${idNum}`} fill={true} sizes="64px" />
            </div>
        </Link>
}

export function RandomSkillIcons() {
    const [ids, setIds] = useState(nRandomInts(count, MAX_RAND_SKILL_ID));
    const { data, loading, error } = useQuery(SKILL_ICONS, { variables: { ids: ids } });
    
    if (error) {
        return <>error</>
    }
    if (loading) {
        return <>...</>
    }

    return <div className="flex flex-row justify-between self-stretch m-2">
        {mapSkillQuery(data).map((value) => <SkillPortrait {...value} key={value.idNum} />)}
    </div>
}

export function SkillPortrait({idNum, imageUrl, skillCategory} : {idNum: number, imageUrl?: string, skillCategory:SkillCategory}){
    return <Link href={`/skill/${idNum}`} className="p-1 aspect-square relative bg-blue-500/25 rounded-xl" >
    <div key={idNum} className="w-12 aspect-square relative bg-blue-500/25 rounded-xl">
        {skillCategoryIcon(skillCategory, imageUrl, false, "48px")}
    </div>
</Link>
}