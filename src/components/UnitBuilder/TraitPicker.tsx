import { getAllEnumEntries, getAllEnumValues } from "enum-for";
import { useContext } from "react";
import { Unit } from "../../engine/types";
import { Language, OptionalStat } from "../../pages/api/dao/types/dao-types";
import { LanguageContext } from "../../pages/testpage";
import { Select } from "../tailwind-styled/sync/Select";
import { ascendantFloretImage, getUiStringResource } from "../ui-resources";
import { MultiplePropMerger } from "./UnitBuilder";

// No Queries


// Helpers
// ----------

const statStringResourceIds = {
    [OptionalStat.HP]: "UNIT_STAT_HP",
    [OptionalStat.ATK]: "UNIT_STAT_ATK",
    [OptionalStat.SPD]: "UNIT_STAT_SPD",
    [OptionalStat.DEF]: "UNIT_STAT_DEF",
    [OptionalStat.RES]: "UNIT_STAT_RES",
    [OptionalStat.NONE]: "UNIT_STAT_NONE",
} as const;
function statStringsForLanguage(language: Language) {
    return (stat: OptionalStat) => getUiStringResource(language, statStringResourceIds[stat]);
}

// No Loaders

// Component
// ---------

export function TraitPicker({
    currentUnit,
    mergeChanges,
}: {
    currentUnit: Unit,
    mergeChanges: MultiplePropMerger,
}) {
    const selectedLanguage = useContext(LanguageContext);
    const statString = statStringsForLanguage(selectedLanguage);

    return <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-1 items-center">
            <label htmlFor="unit-asset">{getUiStringResource(selectedLanguage, "UNIT_ASSET")}</label>
            <Select id="unit-asset" className="w-32"
                value={currentUnit.asset}
                onChange={(choice) => mergeChanges({prop: "asset", value: choice!.value})}
                options={
                    getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                } />
        </div>
        <div className="flex flex-col gap-1 items-center">
            <label htmlFor="unit-flaw">{getUiStringResource(selectedLanguage, "UNIT_FLAW")}</label>
            <Select id="unit-flaw" className="w-32"
                value={currentUnit.flaw}
                onChange={(choice) => mergeChanges({prop: "flaw", value: choice!.value})}
                options={
                    getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                } />
        </div>
        <div className="flex flex-col gap-1 items-center">
            <label htmlFor="unit-ascension">
                <div className="flex items-center">
                    <div className="relative w-6 aspect-square">
                        {ascendantFloretImage()}
                    </div>
                    {getUiStringResource(selectedLanguage, "UNIT_ASCENSION")}
                </div>
            </label>
            <Select id="unit-ascension" className="w-32"
                value={currentUnit.ascension}
                onChange={(choice) => mergeChanges({prop: "ascension", value: choice!.value})}
                options={
                    getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                } />
        </div>
    </div>
}


// Exports
// ---------


function pickANonNoneStat(...notEqualToAnyOfThese: OptionalStat[]) {
    // this is never called with enough excluded stats to get a undefined answer
    return getAllEnumValues(OptionalStat).find(stat => stat != OptionalStat.NONE && !notEqualToAnyOfThese.includes(stat))!
}

// If asset is not none, then ascension cannot be the same as asset
// Iff asset is none, then flaw is none
// if asset is not none, then asset cannot be the same as flaw
// if someone naughty tries to break these rules, set a DIFFERENT prop than the one they just changed to ensure consistency
//   undoing the SAME change someone just made is kind of rude
export function ensureTraitValidity(unit: Unit, justSetTrait: keyof Unit) {
    const ascensionAssetError = (unit.asset !== OptionalStat.NONE && unit.ascension === unit.asset);
    const assetFlawError = (unit.asset !== OptionalStat.NONE && unit.asset === unit.flaw);
    const halfNormalizedError = (unit.asset === OptionalStat.NONE && unit.flaw !== OptionalStat.NONE) || (unit.flaw === OptionalStat.NONE && unit.asset !== OptionalStat.NONE)

    switch (justSetTrait) {
        case "asset":
            if (ascensionAssetError) {
                // tried to set asset to same as ascension when ascension is not none
                unit.ascension = OptionalStat.NONE;
            }
            if (assetFlawError) {
                // tried to set asset to same as flaw when flaw is not none
                unit.flaw = pickANonNoneStat(unit.asset);
            }
            if (halfNormalizedError) {
                // tried to set asset to not none when flaw is none or asset to none when flaw is not none
                unit.flaw = (unit.asset === OptionalStat.NONE) ? OptionalStat.NONE : pickANonNoneStat(unit.asset);
            }
            break;
        case "flaw":
            if (assetFlawError) {
                // tried to set flaw to same as flaw when asset is not none
                unit.asset = pickANonNoneStat(unit.flaw);
            }
            if (halfNormalizedError) {
                // tried to set flaw to not none when asset is none or flaw to none when asset is not none
                unit.asset = (unit.flaw === OptionalStat.NONE) ? OptionalStat.NONE : pickANonNoneStat(unit.flaw);
            }
            break;
        case "ascension":
            if (ascensionAssetError) {
                // tried to set ascension to same as asset when asset is not none
                unit.asset = pickANonNoneStat(unit.flaw, unit.ascension);
            }
            break;
        default: // do nothing
    }
}