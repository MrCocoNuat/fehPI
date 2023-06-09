import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { MAX_LEVEL, MAX_MERGES, MAX_RARITY, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, MIN_RARITY, Rarity, constrainNumeric } from "../../engine/types";
import { statsFor } from "../../engine/stat-calculation";
import { MovementType, OptionalStat, ParameterPerStat } from "../../pages/api/dao/types/dao-types";
import { NumericInput } from "../tailwind-styled/sync/NumericInput";
import { ascendantFloretImage, dragonflowerImage, getUiStringResource, rarityStringForLanguage, statStringsForLanguage } from "../ui-resources";
import { LanguageContext } from "../../pages/_app";
import { Select } from "../tailwind-styled/sync/Select";
import { getAllEnumEntries, getAllEnumValues } from "enum-for";
import { StatDisplay } from "./StatDisplay";

export function StatCalculator({
    heroIdNum,
    useResplendent,
    maxDragonflowers,
    movementType
}: {
    heroIdNum: number,
    useResplendent: boolean,
    maxDragonflowers: number,
    movementType: MovementType
}) {

    const selectedLanguage = useContext(LanguageContext);
    const [rarity, setRarity] = useState(Rarity.FIVE_STARS);
    const rarityString = rarityStringForLanguage(selectedLanguage);
    const [level, setLevel] = useState(40);
    const [merges, setMerges] = useState(0);
    const [dragonflowers, setDragonflowers] = useState(0);
    const [traits, setTraits] = useState({ asset: OptionalStat.NONE, flaw: OptionalStat.NONE, ascension: OptionalStat.NONE });
    const statString = statStringsForLanguage(selectedLanguage);
    const mergeIntoTraits = mergeIntoTraitsWithSetter(setTraits);


    const [stats, setStats] = useState(undefined as ParameterPerStat | undefined);
    useEffect(() => {
        const updater = async () => setStats(await statsFor({
            idNum: heroIdNum,
            rarity: rarity,
            level: level,
            merges: merges,
            dragonflowers: dragonflowers,
            ...traits,
            resplendent: useResplendent
        }));
        updater();
    }
        , [rarity, level, merges, dragonflowers, traits, useResplendent]);

    return <div className="flex flex-col gap-2 p-2 bg-blue-500/25 dark:bg-neutral-900/50/50 rounded-xl ">
        <div className="flex flex-row justify-between">
            <div>
                <Select id="unit-rarity" className="w-18"
                    value={rarity}
                    onChange={(choice) => { setRarity(constrainNumeric(choice!.value, MIN_RARITY, MAX_RARITY)) }}
                    options={
                        getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
                    } />
            </div>
            <div className="flex flex-row items-center">
                <label htmlFor="unit-level">{getUiStringResource(selectedLanguage, "UNIT_LEVEL")}</label>
                <NumericInput className="w-12 sm:w-16" id="unit-level"
                    minMax={{ min: MIN_LEVEL, max: MAX_LEVEL }}
                    value={level}
                    onChange={(evt) => setLevel(constrainNumeric(+evt.target.value, MIN_LEVEL, MAX_LEVEL))} />
                <label htmlFor="unit-merges">+</label>
                <NumericInput className="w-12 sm:w-16" id="unit-merges"
                    minMax={{ min: MIN_MERGES, max: MAX_MERGES }}
                    value={merges}
                    onChange={(evt) => setMerges(constrainNumeric(+evt.target.value, MIN_MERGES, MAX_MERGES))} />
            </div>
            <div className="flex">
                <label htmlFor="unit-dragonflowers" className="flex items-center">
                    <div className="relative w-0 sm:w-8 aspect-square">
                        {dragonflowerImage(movementType)}
                    </div>
                    <div>
                        {getUiStringResource(selectedLanguage, "UNIT_DRAGONFLOWERS")}
                    </div>
                </label>
                <NumericInput className="w-12 sm:w-16" id="unit-dragonflowers"
                    minMax={{ min: MIN_DRAGONFLOWERS, max: maxDragonflowers }}
                    value={dragonflowers}
                    onChange={(evt) => setDragonflowers(constrainNumeric(+evt.target.value, MIN_DRAGONFLOWERS, maxDragonflowers))} />
            </div>
        </div>
        <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1 items-center">
                <label htmlFor="unit-asset">{getUiStringResource(selectedLanguage, "UNIT_ASSET")}</label>
                <Select id="unit-asset" className="w-32"
                    value={traits.asset}
                    onChange={(choice) => mergeIntoTraits(traits, "asset", choice!.value)}
                    options={
                        getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                    } />
            </div>
            <div className="flex flex-col gap-1 items-center">
                <label htmlFor="unit-flaw">{getUiStringResource(selectedLanguage, "UNIT_FLAW")}</label>
                <Select id="unit-flaw" className="w-32"
                    value={traits.flaw}
                    onChange={(choice) => mergeIntoTraits(traits, "flaw", choice!.value)}
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
                    value={traits.ascension}
                    onChange={(choice) => mergeIntoTraits(traits, "ascension", choice!.value)}
                    options={
                        getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                    } />
            </div>
        </div>
        {stats !== undefined && <StatDisplay stats={stats} traits={traits} />}
    </div>
}

const mergeIntoTraitsWithSetter = (setter: Dispatch<SetStateAction<Traits>>) =>
    (traits: Traits, changedTrait: keyof Traits, stat: OptionalStat) => {
        const copy = { ...traits, [changedTrait]: stat };
        mutateToValid(copy, changedTrait);
        setter(copy);
    }


export type Traits = {
    asset: OptionalStat,
    flaw: OptionalStat,
    ascension: OptionalStat
}

function pickANonNoneStat(...notEqualToAnyOfThese: OptionalStat[]) {
    // this is never called with enough excluded stats to get a undefined answer
    return getAllEnumValues(OptionalStat).find(stat => stat != OptionalStat.NONE && !notEqualToAnyOfThese.includes(stat))!
}

// If asset is not none, then ascension cannot be the same as asset
// Iff asset is none, then flaw is none
// if asset is not none, then asset cannot be the same as flaw
// if someone naughty tries to break these rules, set a DIFFERENT prop than the one they just changed to ensure consistency
//   undoing the SAME change someone just made is kind of rude
function mutateToValid(traits: Traits, justSetTrait: keyof Traits) {
    const ascensionAssetError = (traits.asset !== OptionalStat.NONE && traits.ascension === traits.asset);
    const assetFlawError = (traits.asset !== OptionalStat.NONE && traits.asset === traits.flaw);
    const halfNormalizedError = (traits.asset === OptionalStat.NONE && traits.flaw !== OptionalStat.NONE) || (traits.flaw === OptionalStat.NONE && traits.asset !== OptionalStat.NONE)

    switch (justSetTrait) {
        case "asset":
            if (ascensionAssetError) {
                // tried to set asset to same as ascension when ascension is not none
                traits.ascension = OptionalStat.NONE;
            }
            if (assetFlawError) {
                // tried to set asset to same as flaw when flaw is not none
                traits.flaw = pickANonNoneStat(traits.asset);
            }
            if (halfNormalizedError) {
                // tried to set asset to not none when flaw is none or asset to none when flaw is not none
                traits.flaw = (traits.asset === OptionalStat.NONE) ? OptionalStat.NONE : pickANonNoneStat(traits.asset);
            }
            break;
        case "flaw":
            if (assetFlawError) {
                // tried to set flaw to same as flaw when asset is not none
                traits.asset = pickANonNoneStat(traits.flaw);
            }
            if (halfNormalizedError) {
                // tried to set flaw to not none when asset is none or flaw to none when asset is not none
                traits.asset = (traits.flaw === OptionalStat.NONE) ? OptionalStat.NONE : pickANonNoneStat(traits.flaw);
            }
            break;
        case "ascension":
            if (ascensionAssetError) {
                // tried to set ascension to same as asset when asset is not none
                traits.asset = pickANonNoneStat(traits.flaw, traits.ascension);
            }
            break;
        default: // do nothing
    }
}