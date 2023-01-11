import { useContext } from "react";
import { Combatant, Unit } from "../../engine/types"
import { MovementType, SkillCategory, WeaponType } from "../../pages/api/dao/types/dao-types";
import { AllSkillExclusivities } from "../api";
import { FilterSelect } from "../tailwind-styled/FilterSelect";
import { SelectedHeroContext } from "./UnitBuilder";

type SkillExclusivity = { idNum: number, exclusive: boolean };

export function SkillsPicker({
    currentCombatant,
    mergeChanges,
    allSkills,

}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    allSkills: AllSkillExclusivities,
}) {

    const selectedHero = useContext(SelectedHeroContext);

    // not cheap... can this be memoized?
    //const availableSkills = allSkills.filter(skill => skill.weaponEquip.includes(WeaponType[selectedHeroProps.heroWeaponType]))


    return <div className="flex">
    {/*    <FilterSelect id={"unit-weapon-skill"} className="w-80"
            value={undefined}
            onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
            options={[]} />
*/}</div>
}