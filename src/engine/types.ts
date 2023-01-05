export enum Team {
    PLAYER, ENEMY,
}

export enum Terrain {
    NORMAL,
    TRENCH, // Costs cavalry 3 movement to enter
    DEFENSIVE, // %DR
    DEFENSIVE_TRENCH, // both
    WALL_UNBREAKABLE, // no one can enter
    WALL_CRACKED_ONCE, // same, 2 hits break it
    WALL_CRACKED_TWICE,  // same, 1 hit breaks it 
    MOUNTAIN, // only flier can enter
    FOREST, // cavalry cannot enter, costs infantry 2 movement to enter
    DEFENSIVE_FOREST, // both
    WATER, // really redundant with mountain, both admit only fliers... but it looks different enough that it would be weird to exclude
}

export type Unit = {
    idNum: number,
    rarity: number,
    level: number,
    merges: number,
}

export type Combatant = { 
    unit: Unit,
    team: Team,
    tileNumber: number,
}

export type CombatantTeam = Combatant[]

export type BattleTile = {
    terrain: Terrain,
    combatant?: Combatant,
}

export type BattleMap = BattleTile[]

export type BattleContext = {
    combatantTeams: {
        [team in Team] : CombatantTeam
    },
    battleMap: BattleMap,
}