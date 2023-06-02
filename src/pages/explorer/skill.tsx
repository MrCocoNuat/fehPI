import gql from "graphql-tag";
import { OptionalLanguage, RefineType, SkillCategory } from "../api/dao/types/dao-types";
import { LanguageContext } from "../_app";
import { ChangeEvent, useContext, useState } from "react";
import { useQuery } from "@apollo/client";
import { SkillDetailsMini, WeaponDetailsMini } from "../../components/api-explorer/SkillDetails";
import { Checkbox } from "../../components/tailwind-styled/sync/Checkbox";
import { getUiStringResource } from "../../components/ui-resources";

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

type SkillExplorerCheckboxes = {
    showWeaponRefines: boolean
}
const defaultCheckboxes: () => SkillExplorerCheckboxes = () => ({ showWeaponRefines: false });



function filterSkills(skills: SkillQueryResult, filterText: string, checkboxes: SkillExplorerCheckboxes) {
    if (!checkboxes.showWeaponRefines) {
        skills = skills.filter(skill => skill.refineType === undefined || skill.refineType === RefineType.NONE);
    }
    if (filterText !== "") {
        skills = skills.filter(skill => `${skill.name.value} (${skill.idNum})`.toLowerCase().includes(filterText));
    }
    return skills;
}


export default function SkillExplorer() {
    const currentLanguage = useContext(LanguageContext);

    const { loading, error, data } = useQuery(GET_ALL_SKILL, { variables: { language: OptionalLanguage[currentLanguage] } });
    const [filterText, setFilterText] = useState("");
    const [checkboxes, setCheckboxes] = useState(defaultCheckboxes());

    if (loading) {
        return <>...</>
    }
    if (error) {
        return "error";
    }

    const skillQueryResult = filterSkills(mapQuery(data), filterText, checkboxes); // TODO: lang
    return <div className="flex flex-row justify-center border-2 border-green-500">
        <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-center gap-2">
                <input type="text" id="filter-text" placeholder={getUiStringResource(currentLanguage, "SEARCH_PLACEHOLDER_NAME_ID")}
                    onChange={(evt) => {
                        evt.stopPropagation();
                        setFilterText(evt.target.value.toLowerCase());
                    }} />
                <label id={"show-refines-label"}>
                    <Checkbox id={"show-refines"} checked={checkboxes.showWeaponRefines}
                        onChange={(evt) => setCheckboxes({ ...checkboxes, showWeaponRefines: evt.target.checked })} />
                    {getUiStringResource(currentLanguage, "SEARCH_REFINE")}
                </label>

            </div>
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