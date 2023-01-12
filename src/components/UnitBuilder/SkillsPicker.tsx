import { gql, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { filter } from "graphql-yoga";
import { useContext, useMemo } from "react";
import { Combatant, Unit } from "../../engine/types"
import { heroDao } from "../../pages/api/dao/dao-registry";
import { Language, MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { SKILL_NAME, SKILL_NAME_FRAG, SKILL_RESTRICTIONS, SKILL_RESTRICTIONS_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
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
    category: keyof typeof SkillCategory,
    weaponEquip: (keyof typeof WeaponType)[],
    movementEquip: (keyof typeof MovementType)[],
    name: { value: string },
}[]


const inheritablesCache: { [comboKey: number]: AllSkillExclusivities } = {};
function legalInheritables(allSkills: AllSkillExclusivities, { weaponType, movementType }: { weaponType: WeaponType, movementType: MovementType }) {
    const cacheResult = inheritablesCache[movementType * 1000 + weaponType];
    if (cacheResult !== undefined) {
        return cacheResult;
    }
    console.log("cache miss",movementType, weaponType, movementType * 1000 + weaponType)
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
    console.log("rendering skillpicker")

    const [getSkills] = useLazyQuery(GET_ALL_SKILL_NAMES_EXCLUSIVITIES, {
        variables: { lang: Language[selectedLanguage] }
    });

    const skillLoaders = {} as { [skillCategory in SkillCategory]: (Promise<ValueAndLabel<number>[]>) };
    getAllEnumValues(SkillCategory).forEach(skillCategory =>
        // STATICALLY defined loops never change, so this is ok
        skillLoaders[skillCategory] = useMemo((
            async () => {
                console.log("computing skills for", SkillCategory[skillCategory]);
                const queryResult = (await getSkills()).data.skills as AllSkillExclusivities;
                const availableSkills = legalInheritables(queryResult, { weaponType: selectedHero!.weaponType, movementType: selectedHero!.movementType });
                const skills = availableSkills
                    .filter(skill => SkillCategory[skill.category] === skillCategory)
                    .map(skill => ({ value: skill.id, label: skill.name.value }));
                skills.push({ value: 0, label: "none" });
                console.log(SkillCategory[skillCategory], `had ${skills.length} options`)
                return skills;
            }), [selectedHero?.id, selectedLanguage])
    )
    /*  if (selectedHero !== null) {
         const inheritables = getAvailableInheritables(allSkills, selectedHero);
         const fiveStarSkills = selectedHero.skills[0];
         const exclusives = fiveStarSkills.known.filter(skill => skill.exclusive).concat(fiveStarSkills.learnable.filter(skill => skill.exclusive));
     } */


    return <div className="flex flex-col">
        <AsyncFilterSelect id={"unit-weapon-skill"} className="w-80"
            value={currentCombatant.unit.weaponSkillId}
            onChange={(choice) => { mergeChanges("weaponSkillId", +choice!.value); }}
            loadOptions={skillLoaders[SkillCategory.WEAPON]} />
        <AsyncFilterSelect id={"unit-assist-skill"} className="w-80"
            value={currentCombatant.unit.assistSkillId}
            onChange={(choice) => { mergeChanges("assistSkillId", +choice!.value); }}
            loadOptions={skillLoaders[SkillCategory.ASSIST]} />
        <AsyncFilterSelect id={"unit-special-skill"} className="w-80"
            value={currentCombatant.unit.specialSkillId}
            onChange={(choice) => { mergeChanges("specialSkillId", +choice!.value); }}
            loadOptions={skillLoaders[SkillCategory.SPECIAL]} />
    </div>
}
