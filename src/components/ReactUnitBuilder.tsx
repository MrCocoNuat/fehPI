import { useQuery } from "@apollo/client";
import { getAllEnumEntries } from "enum-for";
import { useContext } from "react";
import { deflateRaw } from "zlib";
import { statsFor } from "../engine/stat-calculation"
import { Combatant, constrainNumeric, MAX_LEVEL, MAX_MERGES, MAX_RARITY, MAX_SAFE_DRAGONFLOWERS, MIN_DRAGONFLOWERS, MIN_LEVEL, MIN_MERGES, MIN_RARITY, Rarity, Unit } from "../engine/types";
import { Language, OptionalStat } from "../pages/api/dao/types/dao-types";
import { LanguageContext } from "../pages/testpage";
import { GET_ALL_HERO_NAMES, GET_SINGLE_HERO } from "./api";
import { FilterSelect } from "./tailwind-styled/FilterSelect";
import { NumericInput } from "./tailwind-styled/NumericInput";
import { Select } from "./tailwind-styled/Select";
import { getUiResources } from "./ui-resources";
import { getAllEnumValues } from "enum-for";

function rarityStringsForLanguage(langauge: Language) {
    return (rarity: Rarity) => getUiResources(langauge, "UNIT_RARITY")[rarity];
}

const statStringResourceIds = {
    [OptionalStat.HP]: "UNIT_STAT_HP",
    [OptionalStat.ATK]: "UNIT_STAT_ATK",
    [OptionalStat.SPD]: "UNIT_STAT_SPD",
    [OptionalStat.DEF]: "UNIT_STAT_DEF",
    [OptionalStat.RES]: "UNIT_STAT_RES",
    [OptionalStat.NONE]: "UNIT_STAT_NONE",
} as const;
function statStringsForLanguage(language: Language) {
    return (stat: OptionalStat) => getUiResources(language, statStringResourceIds[stat]);
}

export function ReactUnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {

    const selectedLanguage = useContext(LanguageContext);
    const statString = statStringsForLanguage(selectedLanguage);
    const rarityString = rarityStringsForLanguage(selectedLanguage);
    const { data: heroesData, loading: heroesLoading, error: heroesError } = useQuery(GET_ALL_HERO_NAMES, {
        variables: {
            lang: Language[selectedLanguage],
        }
    });
    // in particular, we need max dragonflowers for the unit
    const { data: unitData, loading: unitLoading, error: unitError } = useQuery(GET_SINGLE_HERO, {
        variables: {
            idNum: combatant.unit.idNum,
        }
    })

    let allHeroes: { idNum: number, name: { value: string }, epithet: { value: string } }[] = [];
    let selectedHeroMaxDragonflowers: number;
    if (!(heroesLoading || unitLoading)) {
        allHeroes = heroesData.heroes;
        selectedHeroMaxDragonflowers = unitData.heroes[0].maxDragonflowers;
    } else {
        // Still render a dehydrated view
        console.log(heroesError);
        selectedHeroMaxDragonflowers = MAX_SAFE_DRAGONFLOWERS;
    }
    const constrainNumericProp = constrainNumericPropWhenMaxDragonflowersIs(selectedHeroMaxDragonflowers);

    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);

    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, value) => {
        const copyUnit = { ...combatant.unit, [prop]: constrainNumericProp(prop, value) };
        ensureTraitConsistency(copyUnit, prop);
        updater({ ...combatant, unit: copyUnit });
    }

    console.log("rerender");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col" onClick={(evt) => evt.stopPropagation()}>
        <div className="flex">
            {/*<UnitPortrait unit={combatant}></UnitPortrait>  there is already a portrait in the team section! */}
            <div>
                <form onSubmit={(evt) => { evt.preventDefault(); }}>
                    <FilterSelect id="unit-idNum" className="w-80"
                        value={{ value: combatant.unit.idNum, label: ((hero) => hero ? (`${hero.name.value}: ${hero.epithet.value}`) : ("..."))(allHeroes.find(hero => hero.idNum === combatant.unit.idNum)) }}
                        onChange={(choice) => { mergeChanges("idNum", +choice!.value) }}
                        options={
                            allHeroes.map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
                        } />
                    <Select id="unit-rarity" className="w-20"
                        value={{ value: combatant.unit.rarity, label: rarityString(combatant.unit.rarity) }}
                        onChange={(choice) => { mergeChanges("rarity", choice!.value) }}
                        options={
                            getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: rarityString(value) }))
                        } />

                    <NumericInput id="unit-level" minMax={{ min: MIN_LEVEL, max: MAX_LEVEL }} value={combatant.unit.level} onChange={(evt) => mergeChanges("level", +evt.target.value)} />
                    <NumericInput id="unit-merges" minMax={{ min: MIN_MERGES, max: MAX_MERGES }} value={combatant.unit.merges} onChange={(evt) => mergeChanges("merges", +evt.target.value)} />
                    <NumericInput id="unit-dragonflowers" minMax={{ min: MIN_DRAGONFLOWERS, max: selectedHeroMaxDragonflowers }} value={combatant.unit.dragonflowers} onChange={(evt) => mergeChanges("dragonflowers", +evt.target.value)} />


                    <Select id="unit-asset" className="w-36"
                        value={{ value: combatant.unit.asset, label: statString(combatant.unit.asset) }}
                        onChange={(choice) => mergeChanges("asset", choice!.value)}
                        options={
                            getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                        } />

                    <Select id="unit-flaw" className="w-36"
                        value={{ value: combatant.unit.flaw, label: statString(combatant.unit.flaw) }}
                        onChange={(choice) => mergeChanges("flaw", choice!.value)}
                        options={
                            getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                        } />
                    <Select id="unit-ascension" className="w-36"
                        value={{ value: combatant.unit.ascension, label: statString(combatant.unit.ascension) }}
                        onChange={(choice) => mergeChanges("ascension", choice!.value)}
                        options={
                            getAllEnumEntries(OptionalStat).map(([key, value]) => ({ value: value, label: statString(value) }))
                        } />
                </form>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}

function constrainNumericPropWhenMaxDragonflowersIs(maxDragonflowers: number) {
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

function pickANonNoneStat(...notEqualToAnyOfThese: OptionalStat[]) {
    // this is never called with enough excluded stats to get a undefined answer
    return getAllEnumValues(OptionalStat).find(stat => stat != OptionalStat.NONE && !notEqualToAnyOfThese.includes(stat))!
}

// If asset is not none, then ascension cannot be the same as asset
// Iff asset is none, then flaw is none
// if asset is not none, then asset cannot be the same as flaw
// if someone naughty tries to break these rules, set a DIFFERENT prop than the one they just changed to ensure consistency
//   undoing the SAME change someone just made is kind of rude
function ensureTraitConsistency(unit: Unit, justSetTrait: keyof Unit) {
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
