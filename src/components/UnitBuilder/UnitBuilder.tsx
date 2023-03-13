import { createContext } from "react";
import { statsFor } from "../../engine/stat-calculation"
import { Combatant, Unit } from "../../engine/types";
import { UnitAndRarityPicker } from "./UnitAndRarityPicker";
import { ensureDragonflowerValidity, LevelMergeDragonflowerPicker } from "./LevelMergeDragonflowerPicker";
import { ensureTraitValidity, TraitPicker } from "./TraitPicker";
import { ensureSkillValidity, SkillsPicker } from "./SkillsPicker";
import { BonusResplendentPickers, ensureBonusResplendentValidity } from "./BonusResplendentPickers";
import { BlessingPicker, ensureBlessingValidity } from "./BlessingPicker";
import { ensureSummonerSupportValidity, SummonerSupportPicker } from "./SummonerSupportPicker.";
import { StatDisplay } from "./StatDisplay";



export const SelectedHeroIdContext = createContext(-1);

// Existential Generics in TS
// thanks jcalz, https://stackoverflow.com/a/65129942
type SingleProp<P extends keyof Unit> = { prop: P, value: Unit[P] };
type SomeSingleProp = <R>(cb: <P extends keyof Unit>(singlePropMerger: SingleProp<P>) => R) => R;
export const someSingleProp = <P extends keyof Unit,>(singlePropMerger: SingleProp<P>): SomeSingleProp => cb => cb(singlePropMerger);

export type MultiplePropMerger = (...changes: SomeSingleProp[]) => void;

export function UnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {
    console.info("rerender unit builder");
    const selectedHeroId = combatant.unit.idNum;

    const mergeChanges: MultiplePropMerger = (...changes) => {
        let copyUnit = { ...combatant.unit };
        changes.forEach(someSingleProp => someSingleProp(singleProp => {
            copyUnit = { ...copyUnit, [singleProp.prop]: singleProp.value };
            // beginning to think there is a better way to do this...
            ensureTraitValidity(copyUnit, singleProp.prop);
            ensureDragonflowerValidity(copyUnit, singleProp.prop);
            ensureSkillValidity(copyUnit, singleProp.prop);
            ensureBlessingValidity(copyUnit, singleProp.prop);
            ensureBonusResplendentValidity(copyUnit, singleProp.prop);
            ensureSummonerSupportValidity(copyUnit, singleProp.prop);
            //TODO: stat calculation directly here? Not in stat-display! need to save it int ocombatant
        }))

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

                    <SkillsPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    <BlessingPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />
                    <SummonerSupportPicker currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    <BonusResplendentPickers currentUnit={combatant.unit} mergeChanges={mergeChanges} />

                    <StatDisplay currentUnit={combatant.unit} />
                </div>
            </form>

        </SelectedHeroIdContext.Provider>
    </div>
}


