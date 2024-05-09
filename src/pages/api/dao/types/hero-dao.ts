import { HonorType, BlessingEffect, BlessingSeason, HeroDefinition, ParameterPerStat, Series, SeriesBitfield, assertIsBlessedHeroDefinition } from "./dao-types";
import { Dao } from "../mixins/dao";
import { IdIndexed } from "../mixins/id-indexed";
import { getAllEnumValues } from "enum-for";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as HeroDefinition;

const keyTypeToken = 0 as number;

export class HeroDao extends VercelKvBacked(typeToken, IdIndexed(typeToken, Dao<HeroDefinition>)) {

    constructor({ repoPath, timerLabel }: { repoPath: string, timerLabel: string }) {
        super({ repoPath });
        console.time(timerLabel);
        console.timeEnd(timerLabel);
    }

    async getByIdNums(idNums: number[]) {
        // grab any unknown values
        const unknownIds = idNums.filter((x) => { return Object.keys(this.collectionIds).indexOf(x.toString()) < 0 });
        if (unknownIds.length > 0){
            await this.setByIds(Object.values(await this.readKeysOfHash("HERO_BY_ID", unknownIds.map(id => id.toString()), keyTypeToken)))
        }
        return this.getByIds(idNums);
    }

}
