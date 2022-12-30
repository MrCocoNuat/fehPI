import { Unit, UnitPortrait } from "./UnitPortrait";

export function UnitTeam({units}: {units: Unit[]}){
    return <div className="flex">{
        units.map((unit,i) => <UnitPortrait key={i} unit={unit}></UnitPortrait>)
    }</div>
}