import { createContext } from "react";
import { statsFor } from "../../engine/stat-calculation"
import { Combatant, Unit } from "../../engine/types";
import { UnitAndRarityPicker } from "./UnitAndRarityPicker";
import { ensureDragonflowerValidity, LevelMergeDragonflowerPicker } from "./LevelMergeDragonflowerPicker";
import { ensureTraitConsistency as ensureTraitValidity, TraitPicker } from "./TraitPicker";
import { ensureSkillValidity, SkillsPicker } from "./SkillsPicker";



export const SelectedHeroIdContext = createContext(-1);

export type MultiplePropMerger = (...changes: { prop: keyof Unit, value: Unit[keyof Unit] }[]) => void;

export function UnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {
    console.info("rerender unit builder");
    const selectedHeroId = combatant.unit.idNum;

    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);

    const mergeChanges: MultiplePropMerger = (...changes) => {
        let copyUnit = { ...combatant.unit };
        changes.forEach(({ prop, value }) => {
            copyUnit = { ...copyUnit, [prop]: value };
            ensureTraitValidity(copyUnit, prop);
            ensureDragonflowerValidity(copyUnit, prop);
            ensureSkillValidity(copyUnit, prop);
        })

        updater({ ...combatant, unit: copyUnit });
    }



    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col"
        // prevent clicking from defocusing
        onClick={(evt) => evt.stopPropagation()}>
        <SelectedHeroIdContext.Provider value={selectedHeroId}>
            <form className="m-2 border-2 border-blue-500" onSubmit={(evt) => { evt.preventDefault(); }}>
                <div className="flex flex-col gap-1">
                    <UnitAndRarityPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    <LevelMergeDragonflowerPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    <TraitPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    {<SkillsPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />}
                </div>
            </form>

            <div>{`stats: ${JSON.stringify(stats)}`}</div>
        </SelectedHeroIdContext.Provider>
    </div>
}


