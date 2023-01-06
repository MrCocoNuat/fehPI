import { statsFor } from "../engine/stat-calculation"
import { Combatant, Rarity } from "../engine/types";
import { UnitPortrait } from "./UnitPortrait";

export function ReactUnitBuilder({
    combatant,
}: {
    combatant?: Combatant,
}) {

    // const someCombatant: Combatant = {
    //     unit: {
    //         idNum: 167,
    //         rarity: 5,
    //         level: 40,
    //         merges: 0,
    //         dragonflowers: 0,
    //         asset: Stat.HP,
    //         flaw: Stat.DEF,
    //         ascension: Stat.SPD,
    //     },
    //     team: Team.PLAYER,
    // }\

    if (combatant === undefined) {
        return null;
    }
    const stats = statsFor(combatant.unit);
    if (typeof stats === "string") {
        return null;
    }

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col">
        <div className="flex">
            <UnitPortrait unit={combatant}></UnitPortrait>
            <div>
                <div>{`idNum: ${combatant.unit.idNum}`}</div>
                <div>{`${Rarity[combatant.unit.rarity]} Lvl: ${combatant.unit.level} +${combatant.unit.merges} df:${combatant.unit.dragonflowers}`}</div>
                <div>{`Traits: +:${combatant.unit.asset} -:${combatant.unit.flaw} ^:${combatant.unit.ascension}`}</div>
                <div>{`stats: ${JSON.stringify(stats)}`}</div>
            </div>
        </div>
    </div>
}