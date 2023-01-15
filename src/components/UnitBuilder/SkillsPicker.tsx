import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { useContext, useEffect, useState } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types"
import { Language, MovementType, OptionalLanguage, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_FIVE_STAR_SKILLS, HERO_FIVE_STAR_SKILLS_FRAG, HERO_MOVEMENT_WEAPON, HERO_MOVEMENT_WEAPON_FRAG, SKILL_NAME, SKILL_NAME_FRAG, SKILL_RESTRICTIONS, SKILL_RESTRICTIONS_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { getUiStringResource, skillCategoryIcon } from "../ui-resources";
import { PassivesPicker as PassivesPickers } from "./PassivesPickers";
import { SelectedHeroIdContext } from "./UnitBuilder";
import { WeaponPicker } from "./WeaponPicker";

// Query
// ----------

const GET_ALL_SKILL_RESTRICTIONS_AND_NAMES = gql`
    ${SKILL_RESTRICTIONS_FRAG}
    ${SKILL_NAME_FRAG}
    query getAllSkillsRestrictionsAndNames($lang: OptionalLanguage!){
        skills{      
            idNum
            ...${SKILL_RESTRICTIONS}
            ...${SKILL_NAME}
        }
    }
`;

type SkillRestrictionsAndNames = {
    idNum: number,
    exclusive: boolean,
    enemyOnly: boolean,
    category: SkillCategory,
    weaponEquip: WeaponType[],
    movementEquip: MovementType[],
    name: { value: string },
}[]

const mapSkillsQuery = (response: any) =>
    response.data.skills.map((responseSkill: any) => ({
        ...responseSkill,
        // enum keys to enum values
        category: SkillCategory[responseSkill.category],
        weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
        movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
    })) as SkillRestrictionsAndNames;

// Query
// ----------

const GET_EXCLUSIVE_SKILLS_MOVEMENT_WEAPON = gql`
    ${HERO_FIVE_STAR_SKILLS_FRAG}
    ${HERO_MOVEMENT_WEAPON_FRAG}
    query getExclusiveSkillsMovementWeapon($heroId: Int!, $lang: OptionalLanguage!){
        heroes(idNums: [$heroId]){
            idNum
            ...${HERO_FIVE_STAR_SKILLS}
            ...${HERO_MOVEMENT_WEAPON}
        }
    }
`
type HeroSkillsMovementWeapon = {
    idNum: number,
    movementType: MovementType,
    weaponType: WeaponType,
    skills: {
        known: { idNum: number, exclusive: boolean, category: SkillCategory, name: { value: string } }[],
        learnable: { idNum: number, exclusive: boolean, category: SkillCategory, name: { value: string } }[]
    },
}
const mapHeroQuery = (response: any) => response.data.heroes.map((responseHero: any) => ({
    idNum: responseHero.idNum,
    movementType: MovementType[responseHero.movementType],
    weaponType: WeaponType[responseHero.weaponType],
    // and also extract the five star skills array element
    skills: {
        known: responseHero.skills[0].known.map((skill: any) => ({ ...skill, category: SkillCategory[skill.category] })),
        learnable: responseHero.skills[0].learnable.map((skill: any) => ({ ...skill, category: SkillCategory[skill.category] }))
    }
}))[0] as HeroSkillsMovementWeapon;


// Helpers
// ----------

function getExclusives({ skills }: HeroSkillsMovementWeapon) {
    // TODO:- PRF EVOLUTIONS
    return [...skills.known, ...skills.learnable].filter(skill => skill.exclusive);
}

function isLegalInheritable(
    skill: {
        exclusive: boolean,
        enemyOnly: boolean,
        weaponEquip: WeaponType[],
        movementEquip: MovementType[]
    },
    { weaponType, movementType }: HeroSkillsMovementWeapon) {
    return (!skill.exclusive
        && !skill.enemyOnly
        && skill.weaponEquip.includes(weaponType)
        && skill.movementEquip.includes(movementType))
}

// Loader
// ----------

const skillLoadersFor = (
    skillsQuery: LazyQueryExecFunction<any, any>,
    heroQuery: LazyQueryExecFunction<any, any>,
    language: Language,
) => {
    const result = {} as { [skillCategory in SkillCategory]: () => Promise<ValueAndLabel<number>[]> };
    getAllEnumValues(SkillCategory).forEach((wantedCategory) => {
        const skillLoader = async () => {
            // not great to repeat, but client-side caching does help a lot
            // alternative is to create a MultipleAsyncFilterSelect component
            const skillQueryResult = mapSkillsQuery(await skillsQuery())
            const heroQueryResult = mapHeroQuery(await heroQuery())

            const valuesAndLabels = [{ value: NONE_SKILL_ID, label: getUiStringResource(language, "UNIT_SKILL_NONE") }];
            // filtering is cheap even for each skill category
            return valuesAndLabels.concat(
                getExclusives(heroQueryResult)
                    .filter(skill => skill.category === wantedCategory)
                    .map(skill => ({ value: skill.idNum, label: skill.name.value })),
                skillQueryResult
                    .filter(skill => skill.category === wantedCategory)
                    .filter(skill => isLegalInheritable(skill, heroQueryResult))
                    .map(skill => ({ value: skill.idNum, label: skill.name.value }))
            );
        };
        result[wantedCategory] = skillLoader;
    });
    return result;

}

// Component
// ----------

export function SkillsPicker({
    currentCombatant,
    mergeChanges,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
}) {
    console.info("rendering skillpicker")
    const selectedLanguage = useContext(LanguageContext);
    const selectedHeroId = useContext(SelectedHeroIdContext);

    const [skillQuery] = useLazyQuery(GET_ALL_SKILL_RESTRICTIONS_AND_NAMES,
        { variables: { lang: OptionalLanguage[selectedLanguage] } }
    );
    const [heroQuery] = useLazyQuery(GET_EXCLUSIVE_SKILLS_MOVEMENT_WEAPON,
        {
            variables: {
                heroId: selectedHeroId,
                lang: OptionalLanguage[selectedLanguage],
            }
        });

    const [skillLoaders, setSkillLoaders] = useState(() =>
        skillLoadersFor(skillQuery, heroQuery, selectedLanguage)
    );
    useEffect(() => {
        setSkillLoaders(() =>
            skillLoadersFor(skillQuery, heroQuery, selectedLanguage)
        );
    }, [selectedLanguage, selectedHeroId]);

    return <div className="flex flex-col">
        <WeaponPicker
            currentCombatant={currentCombatant}
            mergeChanges={mergeChanges}
            skillLoaders={skillLoaders}
        />
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.ASSIST)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-assist-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.assistSkillId}
                onChange={(choice) => { mergeChanges("assistSkillId", +choice!.value); }}
                loadOptions={skillLoaders[SkillCategory.ASSIST]}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.SPECIAL)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-special-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.specialSkillId}
                onChange={(choice) => { mergeChanges("specialSkillId", +choice!.value); }}
                loadOptions={skillLoaders[SkillCategory.SPECIAL]}
                syncValueWithLoadOptions={true} />
        </div>
        <PassivesPickers
            currentCombatant={currentCombatant}
            mergeChanges={mergeChanges}
            skillLoaders={skillLoaders}
        />
    </div>
}
