import { useContext } from "react";
import { Combatant, constrainNumeric, MAX_LEVEL, MAX_MERGES, MAX_RARITY, MAX_SAFE_DRAGONFLOWERS, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, MIN_RARITY, Unit } from "../../engine/types";
import { Language, MovementType } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { NumericInput } from "../tailwind-styled/NumericInput";
import { dragonflowerImage, getUiStringResource } from "../ui-resources";
import { SelectedHeroContext } from "./UnitBuilder";

export function LevelAndMergesPicker(
    {
        currentCombatant,
        mergeChanges,
    }: {
        currentCombatant: Combatant,
        mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void,
    }
) {

    const selectedLanguage = useContext(LanguageContext);
    const selectedHero = useContext(SelectedHeroContext)
    return <div className="flex flex-row justify-between">
        <div>
            <label htmlFor="unit-level">{getUiStringResource(selectedLanguage, "UNIT_LEVEL")}</label>
            <NumericInput className="w-16" id="unit-level"
                minMax={{ min: MIN_LEVEL, max: MAX_LEVEL }}
                value={currentCombatant.unit.level}
                onChange={(evt) => mergeChanges("level", +evt.target.value)} />
            <label htmlFor="unit-merges">+</label>
            <NumericInput className="w-16" id="unit-merges"
                minMax={{ min: MIN_MERGES, max: MAX_MERGES }}
                value={currentCombatant.unit.merges}
                onChange={(evt) => mergeChanges("merges", +evt.target.value)} />
        </div>
        <div className="flex">
            <label htmlFor="unit-dragonflowers">
                <div className="relative w-8 aspect-square">
                    {(selectedHero === null) ? <></> : dragonflowerImage(selectedHero.movementType)}
                </div>
            </label>
            <NumericInput className="w-16" id="unit-dragonflowers"
                minMax={{ min: MIN_DRAGONFLOWERS, max: selectedHero?.maxDragonflowers ?? MAX_SAFE_DRAGONFLOWERS }}
                value={currentCombatant.unit.dragonflowers}
                onChange={(evt) => mergeChanges("dragonflowers", +evt.target.value)} />
        </div>
    </div>
}

export function constrainNumericPropWhenMaxDragonflowersIs(maxDragonflowers: number) {
    // stop naughty people
    // unfortunately typescript cannot determine rawValue's type from the get-go
    return (prop: keyof Unit, rawValue: Unit[typeof prop]) => {
        switch (prop) {
            case "rarity":
                const rarity = rawValue as Unit[typeof prop];
                return constrainNumeric(rarity, MIN_RARITY, MAX_RARITY);
            case "level":
                const level = rawValue as Unit[typeof prop];
                return constrainNumeric(level, MIN_LEVEL, MAX_LEVEL);
            case "merges":
                const merges = rawValue as Unit[typeof prop];
                return constrainNumeric(merges, MIN_MERGES, MAX_MERGES);
            case "dragonflowers":
                const dragonflowers = rawValue as Unit[typeof prop];
                return constrainNumeric(dragonflowers, MIN_DRAGONFLOWERS, maxDragonflowers);
            default:
                return rawValue;
        }
    }
}

// the dragonflower count needs to be reset when the hero changes - it might have a lower max dragonflowers
export function ensureDragonflowerConsistency(unit: Unit, justSetProp: keyof Unit) {
    switch (justSetProp) {
        case "idNum":
            unit.dragonflowers = MIN_DRAGONFLOWERS;
        default: //do nothing
    }
}