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
    unit,
    updater,
}: {
    unit: Unit,
    updater: (newUnit: Unit) => void,
}) {
    console.info("rerender unit builder");
    const selectedHeroId = unit.idNum;

    const mergeChanges: MultiplePropMerger = (...changes) => {
        let copyUnit = { ...unit };
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

        updater(copyUnit);
    }


    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col"
        // prevent clicking from defocusing
        onClick={(evt) => evt.stopPropagation()}>
        <SelectedHeroIdContext.Provider value={selectedHeroId}>
            <form className="m-2 border-2 border-blue-500" onSubmit={(evt) => { evt.preventDefault(); }}>
                <div className="flex flex-col gap-1">
                    <UnitAndRarityPicker currentUnit={unit} mergeChanges={mergeChanges} />

                    <LevelMergeDragonflowerPicker currentUnit={unit} mergeChanges={mergeChanges} />

                    <TraitPicker currentUnit={unit} mergeChanges={mergeChanges} />

                    <SkillsPicker currentUnit={unit} mergeChanges={mergeChanges} />

                    <BlessingPicker currentUnit={unit} mergeChanges={mergeChanges} />
                    <SummonerSupportPicker currentUnit={unit} mergeChanges={mergeChanges} />

                    <BonusResplendentPickers currentUnit={unit} mergeChanges={mergeChanges} />

                    <StatDisplay currentUnit={unit} />
                </div>
            </form>

        </SelectedHeroIdContext.Provider>
    </div>
}


