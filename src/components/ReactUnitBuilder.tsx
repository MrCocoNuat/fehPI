import { useQuery } from "@apollo/client";
import { getAllEnumEntries } from "enum-for";
import { useContext } from "react";
import { statsFor } from "../engine/stat-calculation"
import { Combatant, Rarity, Unit } from "../engine/types";
import { Language, OptionalStat } from "../pages/api/dao/types/dao-types";
import { LanguageContext } from "../pages/testpage";
import { GET_ALL_HERO_NAMES } from "./api";
import { ReactSelect } from "./tailwind-styled/ReactSelect";

export function ReactUnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {

    const selectedLanguage = useContext(LanguageContext);
    const { data, loading, error } = useQuery(GET_ALL_HERO_NAMES, {
        variables: {
            lang: Language[selectedLanguage],
        }
    });

    let heroes: { idNum: number, name: { value: string }, epithet: { value: string } }[] = [];
    if (!(loading || error)) {
        heroes = data.heroes;
    } else {
        console.log(error);
    }
    console.log("querying for hero names with lang:", Language[selectedLanguage]);

    const stats = statsFor(combatant.unit);

    const mergeChanges: (prop: keyof Unit, value: Unit[typeof prop]) => void = (prop, value) => {
        console.log("OK!");
        const copyUnit = { ...combatant.unit, [prop]: value };
        const newCombatant = { ...combatant, unit: copyUnit };
        console.log(`new ${prop} is ${combatant.unit[prop]}`);
        updater(newCombatant);
    }

    console.log("rerender");

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col" onClick={(evt) => evt.stopPropagation()}>
        <div className="flex">
            {/*<UnitPortrait unit={combatant}></UnitPortrait>  there is already a portrait in the team section! */}
            <div>
                <form onSubmit={(evt) => { evt.preventDefault(); }}>
                    <input id="unit-idNum" type="number" value={combatant.unit.idNum} onChange={(evt) => mergeChanges("idNum", +evt.target.value)} />

                    <ReactSelect id="unit-idNum2"
                        value={{ value: combatant.unit.idNum, label: ((hero) => `${hero?.name.value}: ${hero?.epithet.value}`)(heroes.find(hero => hero.idNum === combatant.unit.idNum)) }}
                        onChange={(choice) => { if (choice) mergeChanges("idNum", +choice.value) }}
                        options={
                            heroes.map(hero => ({ value: hero.idNum, label: `${hero.name.value}: ${hero.epithet.value}` }))
                        } />
                    <select id="unit-rarity" value={combatant.unit.rarity} onChange={(evt) => mergeChanges("rarity", +evt.target.value as Rarity)}>
                        {getAllEnumEntries(Rarity).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                    </select> <br />

                    <input id="unit-level" type="number" value={combatant.unit.level} onChange={(evt) => mergeChanges("level", +evt.target.value)} />
                    <input id="unit-merges" type="number" value={combatant.unit.merges} onChange={(evt) => mergeChanges("merges", +evt.target.value)} />
                    <input id="unit-dragonflowers" type="number" value={combatant.unit.dragonflowers} onChange={(evt) => mergeChanges("dragonflowers", +evt.target.value)} />
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