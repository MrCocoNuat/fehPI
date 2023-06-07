import { BlessingSeason, OptionalStat } from "../pages/api/dao/types/dao-types";
import { Rarity, NONE_SKILL, NONE_BLESSING, SupportLevel } from "./types";


export type Unit = {
    idNum: number; // of the Hero that this unit is a copy of!
    rarity: Rarity;
    level: number;
    merges: number;
    dragonflowers: number;

    asset: OptionalStat;
    flaw: OptionalStat;
    ascension: OptionalStat;

    resplendent: boolean;
};
