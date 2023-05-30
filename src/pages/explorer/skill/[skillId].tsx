import { useRouter } from "next/router";
import { INCLUDE_FRAG, PASSIVE_SKILL_IMAGE_URL, PASSIVE_SKILL_IMAGE_URL_FRAG, WEAPON_IMAGE_URL, WEAPON_IMAGE_URL_FRAG } from "../../../components/api-fragments";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { MovementType, MovementTypeBitfield, OptionalLanguage, RefineType, SkillCategory, WeaponType, WeaponTypeBitfield } from "../../api/dao/types/dao-types";
import { LanguageContext } from "../../_app";
import { SkillDetails } from "../../../components/api-explorer/SkillDetails";

const GET_SKILL_IMAGE_URL = gql`
query getSkillImageUrls($id: Int!, $language: OptionalLanguage!){
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
        ... on PassiveSkillDefinition{
            imageUrl
        }
        ... on WeaponDefinition{
            weaponImageUrl : imageUrl
            refineType
        }
    }
}`

export type SkillQueryResult = {
    idNum: number
    idTag: string,
    name: { value: String },
    desc: { value: String },

    //prerequisites: string[],
    //nextSkill: string | null,

    exclusive: boolean,
    enemyOnly: boolean,

    category: SkillCategory,
    weaponEquip: WeaponType[],
    movementEquip: MovementType[],

    imageUrl?: string,
    weaponImageUrl?: string,

    refineType?: RefineType,
}

const mapQuery = (data: any) => data.skills.map((responseSkill: any) => ({
    ...responseSkill,
    category: SkillCategory[responseSkill.category],
    desc: {value: responseSkill.desc.value.replace("\n"," ")},
    weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
    movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
    refineType: (responseSkill.refineType === undefined)? undefined : RefineType[responseSkill.refineType],
}))[0] as SkillQueryResult;

export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);
    const router = useRouter();
    const skillId = +(router.query.skillId as String);

    const {loading, error, data} = useQuery(GET_SKILL_IMAGE_URL, { variables: { id: skillId, language: OptionalLanguage[currentLanguage] } });

    if (loading){
        return <>...</>
    }
    if (error){
        return "error";
    }

    const skillQueryResult = mapQuery(data);
    return <div className="flex flex-row justify-center border-2 border-purple-600">
        <SkillDetails skillDetails={skillQueryResult}/>
    </div>
}