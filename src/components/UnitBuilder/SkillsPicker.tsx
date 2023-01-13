import { gql, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { filter } from "graphql-yoga";
import { useCallback, useContext, useMemo } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types"
import { heroDao } from "../../pages/api/dao/dao-registry";
import { Language, MovementType, OptionalLanguage, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { SKILL_NAME, SKILL_NAME_FRAG, SKILL_RESTRICTIONS, SKILL_RESTRICTIONS_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { getUiStringResource } from "../ui-resources";
import { SelectedHeroContext } from "./UnitBuilder";

const GET_ALL_SKILL_NAMES_EXCLUSIVITIES = gql`
    ${SKILL_RESTRICTIONS_FRAG}
    ${SKILL_NAME_FRAG}
    query getAllSkillExclusivityCategory($lang: OptionalLanguage!){
        skills{
            id
            ...${SKILL_RESTRICTIONS}
            ...${SKILL_NAME}
        }
    }
`;

type AllSkillExclusivities = {
    id: number,
    exclusive: boolean,
    enemyOnly: boolean,
    category: SkillCategory,
    weaponEquip: WeaponType[],
    movementEquip: MovementType[],
    name: { value: string },
}[]



const inheritablesCache: { [comboKey: number]: AllSkillExclusivities } = {};
function legalInheritables(allSkills: AllSkillExclusivities, { weaponType, movementType }: { weaponType: WeaponType, movementType: MovementType }) {
    const cacheResult = inheritablesCache[movementType * 1000 + weaponType];
    if (cacheResult !== undefined) {
        console.log("cache hit for", MovementType[movementType], WeaponType[weaponType], movementType * 1000 + weaponType)
        return cacheResult;
    }
    console.log("cache miss", MovementType[movementType], WeaponType[weaponType], movementType * 1000 + weaponType)
    const calculatedResult = allSkills
        .filter(skill => !skill.exclusive && !skill.enemyOnly)
        .filter(skill => skill.weaponEquip.includes(weaponType))
        .filter(skill => skill.movementEquip.includes(movementType));
    inheritablesCache[movementType * 1000 + weaponType] = calculatedResult;
    return calculatedResult;
}


export function SkillsPicker({
    currentCombatant,
    mergeChanges,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const selectedHero = useContext(SelectedHeroContext);
    console.log("rendering skillpicker with lang", Language[selectedLanguage])

    const [getSkillsRequest] = useLazyQuery(GET_ALL_SKILL_NAMES_EXCLUSIVITIES,
        { variables: { lang: OptionalLanguage[selectedLanguage] } });


    const a = async (wantedCategory: SkillCategory, hero: { weaponType: WeaponType, movementType: MovementType }) => {
        const queryResult = (await getSkillsRequest()).data.skills.map((responseSkill: any) => ({
            ...responseSkill,
            // enum keys to enum values
            category: SkillCategory[responseSkill.category],
            weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
            movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
        })) as AllSkillExclusivities;
        console.log("slowquery for skills, result", queryResult[0].name.value);
        //DEBUGLOG console.log(queryResult);
        return legalInheritables(queryResult, hero)
            .filter(skill => skill.category === wantedCategory)
            .map(hero => ({ value: hero.id, label: hero.name.value }))
            .concat({ value: NONE_SKILL_ID, label: getUiStringResource(selectedLanguage, "UNIT_SKILL_NONE") });
    }

    const weaponSkillLoader = useMemo(() => a(SkillCategory.WEAPON, selectedHero), [selectedLanguage, selectedHero.id])
    const assistSkillLoader = useMemo(() => a(SkillCategory.ASSIST, selectedHero), [selectedLanguage, selectedHero.id])
    const specialSkillLoader = useMemo(() => a(SkillCategory.SPECIAL, selectedHero), [selectedLanguage, selectedHero.id])

    return <div className="flex flex-col">

        <AsyncFilterSelect id={"unit-assist-skill"} className="w-80"
            value={currentCombatant.unit.assistSkillId}
            onChange={(choice) => { mergeChanges("assistSkillId", +choice!.value); }}
            loadOptions={assistSkillLoader} />
        <AsyncFilterSelect id={"unit-special-skill"} className="w-80"
            value={currentCombatant.unit.specialSkillId}
            onChange={(choice) => { mergeChanges("specialSkillId", +choice!.value); }}
            loadOptions={specialSkillLoader} />
    </div>
}
