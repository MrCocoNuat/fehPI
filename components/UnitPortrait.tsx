export enum Team {
    PLAYER, ENEMY
}

export type Unit = { idNum: number, team: Team } // barebones

export function UnitPortrait({ unit }: { unit: Unit }) {
    // yeah, not much of a looker right now...
    return <div className="border-blue-900 border-2 text-center aspect-square">
        {Team[unit.team]} - {unit.idNum}

    </div>
}