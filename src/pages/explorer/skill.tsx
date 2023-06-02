import gql from "graphql-tag";
import { OptionalLanguage, RefineType, SkillCategory } from "../api/dao/types/dao-types";
import { LanguageContext } from "../_app";
import { useContext, useState } from "react";
import { useQuery } from "@apollo/client";
import { SkillDetailsMini, WeaponDetailsMini } from "../../components/api-explorer/SkillDetails";

const GET_ALL_SKILL = gql`
    query getAllSkillMini($language: OptionalLanguage!){
        skills(idNums: null){
            idNum
            name(language: $language){
                value
            }
            category
            ...on PassiveSkillDefinition{
                imageUrl
            }
            ...on WeaponDefinition{
                weaponImageUrl: imageUrl
                refineType
            }
        }
    }
`

type SkillQueryResult = {
    idNum: number,
    name: { value: string },
    category: SkillCategory,
    imageUrl?: string,
    weaponImageUrl?: string,
    refineType: RefineType
}[];

const mapQuery = (data: any) => data.skills.map((skill: any) => ({
    ...skill,
    category: SkillCategory[skill.category],
    refineType: skill.refineType == undefined ? undefined : RefineType[skill.refineType],
})) as SkillQueryResult;

export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);

    const { loading, error, data } = useQuery(GET_ALL_SKILL, { variables: { language: OptionalLanguage[currentLanguage] } });
    const [filterText, setFilterText] = useState("");

    if (loading) {
        return <>...</>
    }
    if (error) {
        return "error";
    }

    const skillQueryResult = mapQuery(data); // TODO: lang
    return <div className="flex flex-row justify-center border-2 border-green-500">
        <div className="flex flex-col">
        <input type="text" id="aaaa" onChange={(evt) => {
                evt.stopPropagation();
                setFilterText(evt.target.value);
            }}/>
            <div className="w-[1200px] grid grid-cols-4 border-2 border-blue-500">
                {skillQueryResult.map((skill) =>
                    skill.category == SkillCategory.WEAPON ?
                        WeaponDetailsMini(skill)
                        : SkillDetailsMini(skill)
                )}
            </div>
        </div>
    </div>
}