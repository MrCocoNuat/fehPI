import { Dao } from "../mixins/dao";
import { VercelKvBacked } from "../mixins/vercel-kv-backed";
import { GrowthVectors } from "./dao-types";

const typeToken = null! as GrowthVectors;

export class GrowthVectorDao extends VercelKvBacked(typeToken, Dao<GrowthVectors>) {
    private initialization: Promise<void>;
    private growthVectors: GrowthVectors[] = [];
    private redisKey = "GROWTH_VECTORS";

    constructor({ repoPath, isBlob, timerLabel }: { repoPath: string, isBlob: boolean, timerLabel: string }) {
        super({ repoPath, isBlob });
        console.time(timerLabel);
        this.initialization = this.getData().then(() => console.timeEnd(timerLabel));
    }

    private async getData() {
        return this.readString(this.redisKey)
        // ok something must have changed on the vercel kv side, because suddenly readString started returning a string[][] instead of a string and I CANNOT be arsed to figure out why. So this stupid parse-stringify dance is needed to keep TS happy
            .then(data => this.growthVectors = JSON.parse(JSON.stringify(data)))
    }

    async getAllGrowthVectors() {
        await this.initialization;
        return this.growthVectors;
    }
}