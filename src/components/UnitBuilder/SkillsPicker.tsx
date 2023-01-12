import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useCallback, useContext } from "react";
import { Combatant, NULL_SKILL_ID, Unit } from "../../engine/types"
import { Language, MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { SKILL_NAME_FRAG, SKILL_RESTRICTIONS_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { FilterSelect } from "../tailwind-styled/FilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { getUiStringResource } from "../ui-resources";
import { SelectedHeroContext } from "./UnitBuilder";

const GET_ALL_SKILL_NAMES_EXCLUSIVITIES = gql`
    ${SKILL_RESTRICTIONS_FRAG}
    ${SKILL_NAME_FRAG}
    query getAllSkillExclusivityCategory($lang: OptionalLanguage!){
        skills{
            id
            ...SkillRestrictions
            ...SkillName
        }
    }
`;
console.log(GET_ALL_SKILL_NAMES_EXCLUSIVITIES);
type AllSkillExclusivities = {
    id: number,
    exclusive: boolean,
    category: SkillCategory,
    weaponEquip: (keyof typeof WeaponType)[],
    movementEquip: (keyof typeof MovementType)[],
    name: { value: string },
}[]


const inheritablesCache: any = {};
function getAvailableInheritables(allSkills: AllSkillExclusivities, { weaponType, movementType }: { weaponType: WeaponType, movementType: MovementType }) {
    const cacheResult = inheritablesCache[movementType * 1000 + weaponType];
    if (cacheResult !== undefined) {
        return cacheResult;
    }
    const weaponTypeKey = WeaponType[weaponType] as keyof typeof WeaponType;
    const movementTypeKey = MovementType[movementType] as keyof typeof MovementType;
    const calculatedResult = allSkills
        .filter(skill => !skill.exclusive)
        .filter(skill => skill.weaponEquip.includes(weaponTypeKey))
        .filter(skill => skill.movementEquip.includes(movementTypeKey));
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

    const [getSkills] = useLazyQuery(GET_ALL_SKILL_NAMES_EXCLUSIVITIES, {
        variables: { lang: Language[selectedLanguage] }
    });
    // const loadSkills = useCallback(async (killCategory: SkillCategory) => {
    //     const queryResult = getSkills();
    //     return () => [0];
    // })

   /*  if (selectedHero !== null) {
        const inheritables = getAvailableInheritables(allSkills, selectedHero);
        const fiveStarSkills = selectedHero.skills[0];
        const exclusives = fiveStarSkills.known.filter(skill => skill.exclusive).concat(fiveStarSkills.learnable.filter(skill => skill.exclusive));
    } */

/* 
    return <div className="flex">
        <AsyncFilterSelect id={"unit-weapon-skill"} className="w-80"
            value={currentCombatant.unit.weaponSkillId}
            onChange={(choice) => { mergeChanges("weaponSkillId", +choice!.value); }}
            loadInitialOptions={} />
    </div>
 */}
