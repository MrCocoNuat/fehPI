export enum Team{
    PLAYER, ENEMY
}

export function UnitPortrait({unit}: {unit: {idNum: number, team: Team}}){
    // yeah, not much of a looker right now...
    return <div className="">
        {Team[unit.team]} - {unit.idNum}
    </div>
}