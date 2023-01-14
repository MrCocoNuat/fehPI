import { gql, LazyQueryExecFunction, useLazyQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { Combatant, NONE_SKILL_ID, Unit } from "../../engine/types"
import { Language, MovementType, OptionalLanguage, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { HERO_FIVE_STAR_SKILLS, HERO_FIVE_STAR_SKILLS_FRAG, HERO_MOVEMENT_WEAPON, HERO_MOVEMENT_WEAPON_FRAG, SKILL_NAME, SKILL_NAME_FRAG, SKILL_RESTRICTIONS, SKILL_RESTRICTIONS_FRAG } from "../api-fragments";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { getUiStringResource, skillCategoryIcon } from "../ui-resources";
import { SelectedHeroIdContext } from "./UnitBuilder";

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

const skillLoaderFor = async (
    skillsQuery: LazyQueryExecFunction<any, any>,
    heroQuery: LazyQueryExecFunction<any, any>,
    wantedCategory: SkillCategory,
    language: Language
) => {

    const skillQueryResult = mapSkillsQuery(await skillsQuery())
    const heroQueryResult = mapHeroQuery(await heroQuery())


    const valuesAndLabels = [{ value: NONE_SKILL_ID, label: getUiStringResource(language, "UNIT_SKILL_NONE") }];
    return valuesAndLabels.concat(
        getExclusives(heroQueryResult)
            .filter(skill => skill.category === wantedCategory)
            .map(skill => ({ value: skill.idNum, label: skill.name.value })),
        skillQueryResult
            .filter(skill => skill.category === wantedCategory)
            .filter(skill => isLegalInheritable(skill, heroQueryResult))
            .map(skill => ({ value: skill.idNum, label: skill.name.value }))
    )
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
    const selectedLanguage = useContext(LanguageContext);
    const selectedHeroId = useContext(SelectedHeroIdContext);
    console.log("rendering skillpicker")

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

    // rules of hooks!
    const [weaponSkillLoader, setWeaponSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.WEAPON, selectedLanguage);
    });
    const [assistSkillLoader, setAssistSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.ASSIST, selectedLanguage);
    });
    const [specialSkillLoader, setSpecialSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.SPECIAL, selectedLanguage);
    });
    const [passiveASkillLoader, setPassiveASkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_A, selectedLanguage);
    });
    const [passiveBSkillLoader, setPassiveBSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_B, selectedLanguage);
    });
    const [passiveCSkillLoader, setPassiveCSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_C, selectedLanguage);
    });
    const [passiveSSkillLoader, setPassiveSSkillLoader] = useState(() => () => {
        return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_S, selectedLanguage);
    });
    useEffect(() => {
        setWeaponSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.WEAPON, selectedLanguage);
        });
        setAssistSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.ASSIST, selectedLanguage);
        });
        setSpecialSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.SPECIAL, selectedLanguage);
        });
        setPassiveASkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_A, selectedLanguage);
        });
        setPassiveBSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_B, selectedLanguage);
        });
        setPassiveCSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_C, selectedLanguage);
        });
        setPassiveSSkillLoader(() => () => {
            return skillLoaderFor(skillQuery, heroQuery, SkillCategory.PASSIVE_S, selectedLanguage);
        });
    }, [selectedLanguage, selectedHeroId]);


    return <div className="flex flex-col">
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.WEAPON)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-weapon-skill"} className="min-w-[320px] flex-1"
                value={currentCombatant.unit.weaponSkillId}
                onChange={(choice) => { mergeChanges("weaponSkillId", +choice!.value); }}
                loadOptions={weaponSkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.ASSIST)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-assist-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.assistSkillId}
                onChange={(choice) => { mergeChanges("assistSkillId", +choice!.value); }}
                loadOptions={assistSkillLoader}
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
                loadOptions={specialSkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_A)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-a-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.passiveASkillId}
                onChange={(choice) => { mergeChanges("passiveASkillId", +choice!.value); }}
                loadOptions={passiveASkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_B)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-b-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.passiveBSkillId}
                onChange={(choice) => { mergeChanges("passiveBSkillId", +choice!.value); }}
                loadOptions={passiveBSkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_C)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-c-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.passiveCSkillId}
                onChange={(choice) => { mergeChanges("passiveCSkillId", +choice!.value); }}
                loadOptions={passiveCSkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_S)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-s-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.passiveSSkillId}
                onChange={(choice) => { mergeChanges("passiveSSkillId", +choice!.value); }}
                loadOptions={passiveSSkillLoader}
                syncValueWithLoadOptions={true} />
        </div>
    </div>
}
