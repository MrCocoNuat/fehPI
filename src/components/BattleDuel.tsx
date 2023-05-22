import { useEffect, useState } from "react"
import { duel } from "../engine/duel/duel"
import { Affiliation, BattleContext, Combatant, Team, Teams, toCombatant } from "../engine/types"

export function BattleDuelComponent({
    teams,
}: {
    teams: Teams
}) {
    const [duelists, setDuelists] = useState([undefined, undefined] as [Combatant?, Combatant?]);
    useEffect(() => {
        const updater = async () => {
            const playerTeam = teams[Affiliation.PLAYER];
            const enemyTeam = teams[Affiliation.ENEMY];
            if (playerTeam.units.length > 0 && enemyTeam.units.length > 0) {
                // no BattleContext yet, only isolated combatants
                const [playerDuelist, enemyDuelist] = [await toCombatant(playerTeam.units[0]), await toCombatant(enemyTeam.units[0])];
                setDuelists([playerDuelist, enemyDuelist]);
                duel(undefined as unknown as BattleContext, playerDuelist, enemyDuelist);
            } else {
                setDuelists([undefined, undefined]);
            }
        }
        updater()
    }
        , [teams]);


    return <div className="flex-grow self-stretch border-2 border-yellow-900">
        test-output: playerteam[0] initiates against enemyteam[0]

        <div>
            {(duelists[0] != undefined && duelists[1] != undefined) &&
                "OK!"
            }
        </div>
    </div>
}
