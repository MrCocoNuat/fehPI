import { getAllEnumEntries } from "enum-for";
import { useState } from "react";
import { statsFor } from "../engine/stat-calculation"
import { Combatant, Rarity, Unit } from "../engine/types";
import { OptionalStat, Stat } from "../pages/api/dao/types/dao-types";
import { UnitPortrait } from "./UnitPortrait";

export function ReactUnitBuilder({
    combatant,
}: {
    combatant: Combatant,
}) {

    //const [bufferUnit, updateBufferUnit] = useState(combatant.unit as Unit);
    //const [bufferUid, updateBufferUid] = useState(Symbol());

    const stats = statsFor(combatant.unit);
    if (typeof stats === "string") {
        return null;
    }

    const updateUnit: () => void = () => {
        //  combatant.unit = {
        //      idNum: 0
        //  }
        console.log("OK!");
    }

    //if (bufferUid !== combatant.uid) {
    //    console.log("changing combatant");
    //    updateBufferUid(combatant.uid);
    //    updateBufferUnit(combatant.unit);
    //}
    console.log("rerender");


    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col" onClick={(evt) => evt.stopPropagation()}>
        <div className="flex">
            <UnitPortrait unit={combatant}></UnitPortrait>
            <div>
                <input value="9"></input>
                <form onSubmit={(evt) => { evt.preventDefault(); updateUnit(); }}>
                    <input id="unit-idNum" type="number" value={combatant.unit.idNum} onChange={(evt) => {console.log("change to", evt.target.value );}} />
                    <select id="unit-rarity" value={combatant.unit.rarity} onChange={(evt) => {console.log("change to", evt.target.value );}}>
                        {getAllEnumEntries(Rarity).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select> <br />

                    <input id="unit-level" type="number" value={combatant.unit.level} />
                    <input id="unit-merges" type="number" value={combatant.unit.merges} />
                    <input id="unit-dragonflowers" type="number" value={combatant.unit.dragonflowers} />
                    <br />

                    <select id="unit-asset" value={combatant.unit.asset ?? "none"}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select>
                    <select id="unit-flaw" value={combatant.unit.flaw ?? "none"}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select>
                    <select id="unit-ascension" value={combatant.unit.ascension ?? "none"}>
                        {getAllEnumEntries(OptionalStat).map(([key, value]) => <option value={value}>{key}</option>)}
                    </select> <br />
                </form>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}