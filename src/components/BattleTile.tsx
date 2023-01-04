import { MouseEventHandler } from "react";
import { Team, UnitPortrait } from "./UnitPortrait";

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
    DEFENSIVE_FOREST,
    WATER, // really redundant with mountain, both admit only fliers... but it looks different enough that it would be weird to exclude
}

export function BattleTile({ unit, terrain, clickHandler, mouseEnterHandler, mouseLeaveHandler }:
    {
        unit?: { team: Team, idNum: number },
        terrain: Terrain,
        clickHandler: MouseEventHandler,
        mouseEnterHandler: MouseEventHandler,
        mouseLeaveHandler: MouseEventHandler
    }) {
    return <div className="border-red-900 border-2 text-sm">
        <UnitPortrait unit={unit} clickHandler={clickHandler} mouseEnterHandler={mouseEnterHandler} mouseLeaveHandler={mouseLeaveHandler}></UnitPortrait>
        {Terrain[terrain]}
    </div>
}