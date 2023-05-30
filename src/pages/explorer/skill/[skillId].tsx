import { useRouter } from "next/router";
import { INCLUDE_FRAG, PASSIVE_SKILL_IMAGE_URL, PASSIVE_SKILL_IMAGE_URL_FRAG, WEAPON_IMAGE_URL, WEAPON_IMAGE_URL_FRAG } from "../../../components/api-fragments";
import { gql, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { MovementType, MovementTypeBitfield, OptionalLanguage, SkillCategory, WeaponType, WeaponTypeBitfield } from "../../api/dao/types/dao-types";
import { LanguageContext } from "../../_app";

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

}

const mapQuery = (response: any) => response.data.skills.map((responseSkill: any) => ({
    ...responseSkill,
    category: SkillCategory[responseSkill.category],
    weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
    movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),

}))[0] as SkillQueryResult;

export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);
    const router = useRouter();
    const skillId = +(router.query.skillId as String);

    const [skillQueryResult, setSkillQueryResult] = useState(undefined as SkillQueryResult | undefined);
    const [skillImageQuery] = useLazyQuery(GET_SKILL_IMAGE_URL, { variables: { id: skillId, language: OptionalLanguage[currentLanguage] } });
    useEffect(() => {
        const update = async () => {
            const result = mapQuery(await skillImageQuery());
            //setSkillImageUrl(result.imageUrl ?? result.weaponImageUrl);
            setSkillQueryResult(result);
        };
        update();
    }, [])

    return <div>
        skill explorer: id {router.query.skillId}
        {skillQueryResult?.imageUrl && <Image src={skillQueryResult.imageUrl} alt={`Icon of skill ${skillId}`} width={60} height={60} />}
        {skillQueryResult?.weaponImageUrl && <Image src={skillQueryResult.weaponImageUrl} alt={`Icon of weapon refine ${skillId}`} width={60} height={60} />}
    </div>
}