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

export function ReactUnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {

    const selectedLanguage = useContext(LanguageContext);
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

    let heroes: { idNum: number, name: { value: string }, epithet: { value: string } }[] = [];
    let selectedUnitMaxDragonflowers: number;
    if (!(heroesLoading || unitLoading)) {
        heroes = heroesData.heroes;
        selectedUnitMaxDragonflowers = unitData.heroes[0].maxDragonflowers;
    } else {
        // Still render a dehydrated view
        console.log(heroesError);
        selectedUnitMaxDragonflowers = MAX_SAFE_DRAGONFLOWERS;
    }

    //TODO:- probably should be a useEffect instead
    const stats = statsFor(combatant.unit);

    // stop naughty people
    // unfortunately typescript cannot determine rawValue's type from the get-go
    const constrainNumericProp: (prop: keyof Unit, rawValue: Unit[typeof prop]) => Unit[typeof prop] = (prop, rawValue) => {
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
                return constrainNumeric(dragonflowers, MIN_DRAGONFLOWERS, selectedUnitMaxDragonflowers);
            default:
                return rawValue;
        }
    }

    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, value) => {
        console.log("OK!");
        const copyUnit = { ...combatant.unit, [prop]: constrainNumericProp(prop, value) };
        const newCombatant = { ...combatant, unit: copyUnit };
        console.log(`new ${prop} is ${newCombatant.unit[prop]}`);
        updater(newCombatant);
    }

    console.log("rerender");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col" onClick={(evt) => evt.stopPropagation()}>
        <div className="flex">
            {/*<UnitPortrait unit={combatant}></UnitPortrait>  there is already a portrait in the team section! */}
            <div>
                <form onSubmit={(evt) => { evt.preventDefault(); }}>
                    <FilterSelect id="unit-idNum" className="w-80"
                        value={{ value: combatant.unit.idNum, label: ((hero) => hero ? (`${hero.name.value}: ${hero.epithet.value}`) : ("..."))(heroes.find(hero => hero.idNum === combatant.unit.idNum)) }}
                        onChange={(choice) => { if (choice) mergeChanges("idNum", +choice.value) }}
                        options={
                            heroes.map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
                        } />
                    <Select id="unit-rarity"
                        value={{ value: combatant.unit.rarity, label: Rarity[combatant.unit.rarity] }}
                        onChange={(choice) => { if (choice) mergeChanges("rarity", choice.value as Rarity) }}
                        options={
                            getAllEnumEntries(Rarity).map(([key, value]) => ({ value: value, label: key }))
                        } />

                    <NumericInput id="unit-level" minMax={{ min: MIN_LEVEL, max: MAX_LEVEL }} value={combatant.unit.level} onChange={(evt) => mergeChanges("level", +evt.target.value)} />
                    <NumericInput id="unit-merges" minMax={{ min: MIN_MERGES, max: MAX_MERGES }} value={combatant.unit.merges} onChange={(evt) => mergeChanges("merges", +evt.target.value)} />
                    <NumericInput id="unit-dragonflowers" minMax={{ min: MIN_DRAGONFLOWERS, max: selectedUnitMaxDragonflowers }} value={combatant.unit.dragonflowers} onChange={(evt) => mergeChanges("dragonflowers", +evt.target.value)} />
                    <br />

                    <select id="unit-asset" value={combatant.unit.asset} onChange={(evt) => mergeChanges("asset", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                    </select>
                    <select id="unit-flaw" value={combatant.unit.flaw} onChange={(evt) => mergeChanges("flaw", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                    </select>
                    <select id="unit-ascension" value={combatant.unit.ascension} onChange={(evt) => mergeChanges("ascension", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                    </select> <br />
                </form>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}