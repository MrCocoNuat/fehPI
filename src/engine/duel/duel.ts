import { BattleContext, Combatant } from "../types";

export function duel(battleContext: BattleContext, initiator: Combatant, opponent: Combatant){
    checkErrorConditions(battleContext,initiator,opponent)
}

function checkErrorConditions(battleContext: BattleContext, initiator: Combatant, opponent: Combatant){
    if (initiator.currentHp === 0)
        throw new Error("initiator is dead");
    if (initiator.tapped)
        throw new Error("initiator is already tapped");
        
    if (opponent.currentHp === 0)
        throw new Error("opponent is dead");

    // if (initiator.team === opponent.team)
    //     throw new Error("duel between combatants of same team not allowed");
}