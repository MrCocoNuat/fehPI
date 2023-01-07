import { getAllEnumEntries } from "enum-for";
import { statsFor } from "../engine/stat-calculation"
import { Combatant, Rarity, Unit } from "../engine/types";
import { OptionalStat } from "../pages/api/dao/types/dao-types";
import { UnitPortrait } from "./UnitPortrait";

export function ReactUnitBuilder({
    combatant,
    updater,
}: {
    combatant: Combatant,
    updater: (newCombatant: Combatant) => void,
}) {

    //const [bufferUnit, updateBufferUnit] = useState(combatant.unit as Unit);
    //const [bufferUid, updateBufferUid] = useState(Symbol());

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
                    {/* to be replaced with react-select */}
                    <select id="unit-rarity" value={combatant.unit.rarity} onChange={(evt) => mergeChanges("rarity", +evt.target.value as Rarity)}>
                        {getAllEnumEntries(Rarity).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select> <br />

                    <input id="unit-level" type="number" value={combatant.unit.level} onChange={(evt) => mergeChanges("level", +evt.target.value)} />
                    <input id="unit-merges" type="number" value={combatant.unit.merges} onChange={(evt) => mergeChanges("merges", +evt.target.value)} />
                    <input id="unit-dragonflowers" type="number" value={combatant.unit.dragonflowers} onChange={(evt) => mergeChanges("dragonflowers", +evt.target.value)} />
                    <br />

                    <select id="unit-asset" value={combatant.unit.asset} onChange={(evt) => mergeChanges("asset", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select>
                    <select id="unit-flaw" value={combatant.unit.flaw} onChange={(evt) => mergeChanges("flaw", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select>
                    <select id="unit-ascension" value={combatant.unit.ascension} onChange={(evt) => mergeChanges("ascension", evt.target.value as OptionalStat)}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select> <br />
                </form>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}