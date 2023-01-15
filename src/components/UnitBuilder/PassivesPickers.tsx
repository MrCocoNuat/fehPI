import { Combatant, Unit } from "../../engine/types";
import { SkillCategory } from "../../pages/api/dao/types/dao-types";
import { AsyncFilterSelect } from "../tailwind-styled/AsyncFilterSelect";
import { ValueAndLabel } from "../tailwind-styled/Select";
import { skillCategoryIcon } from "../ui-resources";

// also responsible for rendering skill icons

// Component
// ----------

export function PassivesPicker({
    currentCombatant,
    mergeChanges,
    skillLoaders,
}: {
    currentCombatant: Combatant,
    mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    skillLoaders: {[skillCategory in SkillCategory] : () => Promise<ValueAndLabel<number>[]>}
}) {
    return <>
        <div className="flex items-center">
            <label htmlFor="unit-weapon-skill">
                <div className="w-8 aspect-square relative m-1">
                    {skillCategoryIcon(SkillCategory.PASSIVE_A)}
                </div>
            </label>
            <AsyncFilterSelect id={"unit-passive-a-skill"} className="w-80 flex-1"
                value={currentCombatant.unit.passiveASkillId}
                onChange={(choice) => { mergeChanges("passiveASkillId", +choice!.value); }}
                loadOptions={skillLoaders[SkillCategory.PASSIVE_A]}
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
                loadOptions={skillLoaders[SkillCategory.PASSIVE_B]}
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
                loadOptions={skillLoaders[SkillCategory.PASSIVE_C]}
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
                loadOptions={skillLoaders[SkillCategory.PASSIVE_S]}
                syncValueWithLoadOptions={true} />
        </div>
    </>
}