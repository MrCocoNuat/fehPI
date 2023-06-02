import { useState } from "react";

export enum FocusType {
    TILE,
    TILE_UNIT,
    TEAM_UNIT,
    NONE,
}
export type Focus = {
    type: FocusType,
    info: any
}


export function BattlePane(props: any) {


    return <div className="flex flex-col 2xl:flex-row gap-2 2xl:gap-5 border-2 border-green-900 p-2 2xl:p-5"
        // any click not stopped will bubble here and clear the focus
        onClick={(evt) => { evt.stopPropagation(); }}>
            gone
    </div>
}

