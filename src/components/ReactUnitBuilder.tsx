import { useQuery } from "@apollo/client"
import { statsFor } from "../engine/stat-calculation"
import { Combatant, Team, Unit } from "../engine/types";
import { Stat } from "../pages/api/dao/types/dao-types";
import { UnitPortrait } from "./UnitPortrait";

export function ReactUnitBuilder(props: any) {

    const someCombatant: Combatant = {
        unit: {
            idNum: 167,
            rarity: 5,
            level: 40,
            merges: 0,
            dragonflowers: 0,
            asset: Stat.HP,
            flaw: Stat.DEF,
            ascension: Stat.SPD,
        },
        team: Team.PLAYER,
    }
    const stats = statsFor(someCombatant.unit);
    if (typeof stats === "string") {
        return null; 
    }

    return <div className="flex-grow self-stretch border-2 border-yellow-900 flex flex-col">
        <div className="flex">
        <UnitPortrait unit={someCombatant}></UnitPortrait>
        <div>{`stats: ${JSON.stringify(stats)}`}</div>
        </div>
    </div>
}