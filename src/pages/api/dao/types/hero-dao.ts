import { HonorType, BlessingEffect, BlessingSeason, HeroDefinition, ParameterPerStat, Series, SeriesBitfield, assertIsBlessedHeroDefinition } from "./dao-types";
import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { WriteOnceIdIndexed } from "../mixins/id-indexed";
import { getAllEnumValues } from "enum-for";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";

// typescript needs this to correctly infer the type parameters of generic mixins, 
// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as HeroDefinition;

const keyTypeToken = 0 as number;

export class HeroDao extends VercelKvBacked(typeToken, WriteOnceIdIndexed(typeToken, Dao<HeroDefinition>)) {
    private initialization: Promise<void>;

    constructor({ repoPath, timerLabel }: { repoPath: string, timerLabel: string }) {
        super({ repoPath });
        console.time(timerLabel);
        this.initialization = this.getData();
    }

    private async getData() {
        this.setByIds(Object.values(await this.readHash("HERO_BY_ID", keyTypeToken))); 
    }

    async getByIdNums(idNums: number[]) {
        await this.initialization;
        return this.getByIds(idNums);
    }

    async getAll() {
        await this.initialization;
        return this.getAllIds();
    }
}
