import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
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
            .then(data => this.growthVectors = JSON.parse(data))
    }

    async getAllGrowthVectors() {
        await this.initialization;
        return this.growthVectors;
    }
}