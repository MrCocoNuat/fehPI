import { useContext } from "react";
import { Combatant, NULL_SKILL_ID, Unit } from "../../engine/types"
import { MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { AllSkillExclusivities } from "../api";
import { FilterSelect } from "../tailwind-styled/FilterSelect";
import { getUiStringResource } from "../ui-resources";
import { SelectedHeroContext } from "./UnitBuilder";

type SkillExclusivity = { idNum: number, exclusive: boolean };

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
    allSkills,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    allSkills: AllSkillExclusivities,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const selectedHero = useContext(SelectedHeroContext);

    if (selectedHero !== null) {
        const inheritables = getAvailableInheritables(allSkills, selectedHero);
        const fiveStarSkills = selectedHero.skills[0];
        const exclusives = fiveStarSkills.known.filter(skill => skill.exclusive).concat(fiveStarSkills.learnable.filter(skill => skill.exclusive));
    }

    return <div className="flex">
        <FilterSelect id={"unit-weapon-skill"} className="w-80"
            value={{
                value: currentCombatant.unit.weaponSkillId,
                label: (currentCombatant.unit.weaponSkillId === NULL_SKILL_ID) ? (getUiStringResource(selectedLanguage, "UNIT_SKILL_NONE")) :
                    ((weapon) => weapon ? weapon.name.value : ("..."))(allSkills.find(skill => skill.idNum === currentCombatant.unit.weaponSkillId))
            }}
            onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
            options={[]} />
    </div>
}
