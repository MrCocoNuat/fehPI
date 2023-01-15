import { Combatant, Unit } from "../../engine/types";
import { SkillCategory } from "../../pages/api/dao/types/dao-types";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { skillCategoryIcon } from "../ui-resources";

// weapons need refine handling... and evolutions even though nobody is going to use them

export function WeaponPicker({
    currentCombatant,
    mergeChanges,
    skillLoaders,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    skillLoaders: {[skillCategory in SkillCategory] : () => Promise<ValueAndLabel<number>[]>}
}) {
    return <div className="flex items-center">
        <label htmlFor="unit-weapon-skill">
            <div className="w-8 aspect-square relative m-1">
                {skillCategoryIcon(SkillCategory.WEAPON)}
            </div>
        </label>
        <AsyncFilterSelect id={"unit-weapon-skill"} className="min-w-[320px] flex-1"
            value={currentCombatant.unit.weaponSkillId}
            onChange={(choice) => { mergeChanges("weaponSkillId", +choice!.value); }}
            loadOptions={skillLoaders[SkillCategory.WEAPON]}
            syncValueWithLoadOptions={true} />
    </div>
}