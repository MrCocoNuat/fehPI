import { gql, useLazyQuery } from "@apollo/client";
import { getAllEnumValues } from "enum-for";
import { filter } from "graphql-yoga";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
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


function getExclusives({ skills }: {
    skills: {
        known: { id: number, exclusive: boolean, category: SkillCategory, name: { value: string } }[],
        learnable: { id: number, exclusive: boolean, category: SkillCategory, name: { value: string } }[]
    },
}) {
    // TODO:- PRF EVOLUTIONS
    return [...skills.known, ...skills.learnable].filter(skill => skill.exclusive);
}

function isLegalInheritable(skill: {
    exclusive: boolean,
    enemyOnly: boolean,
    weaponEquip: WeaponType[],
    movementEquip: MovementType[]
}, { weaponType, movementType }: {
    weaponType: WeaponType, movementType: MovementType
}) {
    return (!skill.exclusive
        && !skill.enemyOnly
        && skill.weaponEquip.includes(weaponType)
        && skill.movementEquip.includes(movementType))
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

    const [getSkillsRequest] = useLazyQuery(GET_ALL_SKILL_NAMES_EXCLUSIVITIES,
        { variables: { lang: OptionalLanguage[selectedLanguage] } }
    );

    const skillLoaderFor = async (wantedCategory: SkillCategory) => {
        const queryResult = (await getSkillsRequest()).data.skills.map((responseSkill: any) => ({
            ...responseSkill,
            // enum keys to enum values
            category: SkillCategory[responseSkill.category],
            weaponEquip: responseSkill.weaponEquip.map((weaponTypeKey: keyof typeof WeaponType) => WeaponType[weaponTypeKey]),
            movementEquip: responseSkill.movementEquip.map((movementTypeKey: keyof typeof MovementType) => MovementType[movementTypeKey]),
        })) as AllSkillExclusivities;
        const mapped = [{ value: NONE_SKILL_ID, label: getUiStringResource(selectedLanguage, "UNIT_SKILL_NONE") }];
        return mapped.concat(
            getExclusives(selectedHero)
                .filter(skill => skill.category === wantedCategory)
                .map(skill => ({ value: skill.id, label: skill.name.value })),
            queryResult
                .filter(skill => skill.category === wantedCategory)
                .filter(skill => isLegalInheritable(skill, selectedHero))
                .map(skill => ({ value: skill.id, label: skill.name.value }))
        )
    }

    // rules of hooks
    const [weaponSkillLoader, setWeaponSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.WEAPON);
    });
    const [assistSkillLoader, setAssistSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.ASSIST);
    });
    const [specialSkillLoader, setSpecialSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.SPECIAL);
    });
    const [passiveASkillLoader, setPassiveASkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.PASSIVE_A);
    });
    const [passiveBSkillLoader, setPassiveBSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.PASSIVE_B);
    });
    const [passiveCSkillLoader, setPassiveCSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.PASSIVE_C);
    });
    const [passiveSSkillLoader, setPassiveSSkillLoader] = useState(() => () => {
        return skillLoaderFor(SkillCategory.PASSIVE_S);
    });
    useEffect(() => {
        setWeaponSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.WEAPON);
        });
        setAssistSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.ASSIST);
        });
        setSpecialSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.SPECIAL);
        });
        setPassiveASkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.PASSIVE_A);
        });
        setPassiveBSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.PASSIVE_B);
        });
        setPassiveCSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.PASSIVE_C);
        });
        setPassiveSSkillLoader(() => () => {
            return skillLoaderFor(SkillCategory.PASSIVE_S);
        });
    }, [selectedLanguage, selectedHero.id]);


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
