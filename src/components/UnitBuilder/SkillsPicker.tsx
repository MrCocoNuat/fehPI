import { gql, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { filter } from "graphql-yoga";
import { useCallback, useContext, useMemo } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types"
import { heroDao } from "../../pages/api/dao/dao-registry";
import { Language, MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
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
        .filter(skill => !skill.exclusive)
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
    console.log("rendering skillpicker")

    const [getSkills] = useLazyQuery(GET_ALL_SKILL_NAMES_EXCLUSIVITIES, {
        variables: { lang: Language[selectedLanguage] }
    });

    const availableSkills = useMemo(() => getSkills()
        .then(response => response.data.skills
            .map((responseSkill: any) => ({
                ...responseSkill,
                // enum keys to enum values
                category: SkillCategory[responseSkill.category],
                weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
                movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
            })) as AllSkillExclusivities)
        .then(allSkills => legalInheritables(allSkills, selectedHero))
        .then(x => {console.log("skills re-memoed");return x;}),
        [selectedHero.id, selectedLanguage])

    const NONE_SKILL_VALUE_AND_LABEL = { value: NONE_SKILL_ID, label: getUiStringResource(selectedLanguage, "UNIT_SKILL_NONE") };
    const skillLoader: (desiredSkillCategory: SkillCategory) => (Promise<ValueAndLabel<number>[]>) = useCallback(async (desiredSkillCategory) => {
        const skills = (await availableSkills)
            // tack on skills exclusive to the hero,
            // both known
            .concat(selectedHero.skills.known
                .filter(skill => skill.exclusive)
                // and give them dummy weapon and movementEquip so they match type
                .map(skill => ({ ...skill, weaponEquip: [], movementEquip: [] })))
            // and learnable
            .concat(selectedHero.skills.learnable
                .filter(skill => skill.exclusive)
                .map(skill => ({ ...skill, weaponEquip: [], movementEquip: [] })))
            .filter(skill => skill.category === desiredSkillCategory)
            .map(skill => ({ value: skill.id, label: skill.name.value }))
        // finally add the None skill
        skills.push(NONE_SKILL_VALUE_AND_LABEL);
        return skills;
    }, [selectedHero.id, selectedLanguage]);

    const weaponSkillLoader = useMemo(() => skillLoader(SkillCategory.WEAPON), [selectedHero.id, selectedLanguage]);
    const assistSkillLoader = useMemo(() => skillLoader(SkillCategory.ASSIST), [selectedHero.id, selectedLanguage]);
    const specialSkillLoader = useMemo(() => skillLoader(SkillCategory.SPECIAL), [selectedHero.id, selectedLanguage]);
    const passiveASkillLoader = useMemo(() => skillLoader(SkillCategory.PASSIVE_A), [selectedHero.id, selectedLanguage]);
    const passiveBSkillLoader = useMemo(() => skillLoader(SkillCategory.PASSIVE_B), [selectedHero.id, selectedLanguage]);
    const passiveCSkillLoader = useMemo(() => skillLoader(SkillCategory.PASSIVE_C), [selectedHero.id, selectedLanguage]);
    const passiveSSkillLoader = useMemo(() => skillLoader(SkillCategory.PASSIVE_S), [selectedHero.id, selectedLanguage]);

    return <div className="flex flex-col">
        <AsyncFilterSelect id={"unit-weapon-skill"} className="w-80"
            value={currentCombatant.unit.weaponSkillId}
            onChange={(choice) => { mergeChanges("weaponSkillId", +choice!.value); }}
            loadOptions={weaponSkillLoader} />
        <AsyncFilterSelect id={"unit-assist-skill"} className="w-80"
            value={currentCombatant.unit.assistSkillId}
            onChange={(choice) => { mergeChanges("assistSkillId", +choice!.value); }}
            loadOptions={assistSkillLoader} />
        <AsyncFilterSelect id={"unit-special-skill"} className="w-80"
            value={currentCombatant.unit.specialSkillId}
            onChange={(choice) => { mergeChanges("specialSkillId", +choice!.value); }}
            loadOptions={specialSkillLoader} />
        <AsyncFilterSelect id={"unit-passive-a-skill"} className="w-80"
            value={currentCombatant.unit.passiveASkillId}
            onChange={(choice) => { mergeChanges("passiveASkillId", +choice!.value); }}
            loadOptions={passiveASkillLoader} />
        <AsyncFilterSelect id={"unit-passive-b-skill"} className="w-80"
            value={currentCombatant.unit.passiveBSkillId}
            onChange={(choice) => { mergeChanges("passiveBSkillId", +choice!.value); }}
            loadOptions={passiveBSkillLoader} />
        <AsyncFilterSelect id={"unit-passive-c-skill"} className="w-80"
            value={currentCombatant.unit.passiveCSkillId}
            onChange={(choice) => { mergeChanges("passiveCSkillId", +choice!.value); }}
            loadOptions={passiveCSkillLoader} />
        <AsyncFilterSelect id={"unit-passive-s-skill"} className="w-80"
            value={currentCombatant.unit.passiveSSkillId}
            onChange={(choice) => { mergeChanges("passiveSSkillId", +choice!.value); }}
            loadOptions={passiveSSkillLoader} />
    </div>
}
