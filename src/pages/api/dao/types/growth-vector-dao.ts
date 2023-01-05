import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { GrowthVectors } from "./dao-types";

const typeToken = null! as GrowthVectors;

export class GrowthVectorDao extends GithubSourced(typeToken, Dao<GrowthVectors>) {
    private initialization: Promise<void>;
    private growthVectors: GrowthVectors[] = [];

    constructor({ repoPath, isBlob, timerLabel }: { repoPath: string, isBlob: boolean, timerLabel: string }) {
        super({ repoPath, isBlob });
        console.time(timerLabel);
        this.initialization = this.loadData().then(() => console.timeEnd(timerLabel));
    }

    private async loadData() {
        return this.getGithubData()
            // .then(data => data.map(growthVectorPerIndex => growthVectorPerIndex.map(growthVector => String(growthVector/4))))
            .then(data => this.growthVectors = data)
    }

    // remove 2 LSBs and turn into a string so it can be transmitted
    protected toValueType: (json: any) => GrowthVectors = (json) => (json.map((bitvector: number) => String(bitvector / 4)));

    async getAllGrowthVectors() {
        await this.initialization;
        return this.growthVectors;
    }
}