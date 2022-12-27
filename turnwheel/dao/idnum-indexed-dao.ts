import path from "path";
import { IdNumIndexed } from "../types/dao-types";
import { GitObjectType } from "../types/git-types";
import { fehAssetsJsonReader } from "./remote-repository";

export interface IdNumIndexedDao<V extends IdNumIndexed> {
    getByIdNum(idNum: number) : Promise<V>; 
}

export default abstract class IdNumIndexedDaoImpl<V extends IdNumIndexed> implements IdNumIndexedDao<V> {
    protected collection : {[idNum : number] : V};
    protected initialization : Promise<void>;
    protected REPO_PATH : string;
    protected TIMER_LABEL : string;

    constructor({REPO_PATH, TIMER_LABEL} : {REPO_PATH: string, TIMER_LABEL: string}){
        this.collection = {};
        this.REPO_PATH = REPO_PATH;
        this.TIMER_LABEL = TIMER_LABEL;

        this.initialization = this.initialize();
    }

    protected async initialize() {
        console.time(this.TIMER_LABEL);
        await this.processTree();
        console.timeEnd(this.TIMER_LABEL);
    }

    protected async processTree() {
        // get all of the files in the tree - these are mostly per-update
        const tree = await fehAssetsJsonReader.queryForTree(this.REPO_PATH);
        const entries = tree.repository.object.entries.filter(entry => entry.type === "blob");

        // for each file, get contents
        for (const entry of entries) {
            await this.processBlob(entry);
        }
    }

    private async processBlob(entry: { name: string; type: GitObjectType; object: { isTruncated: boolean; }; }) {
        const entryPath = path.join(this.REPO_PATH, entry.name);
        let blobJson;

        if ((entry.object.isTruncated)) {
            // need to make an ordinary GET request
            const blobText = await fehAssetsJsonReader.getRawBlob(entryPath);
            blobJson = JSON.parse(blobText) as [any];
        } else {
            const blob = await fehAssetsJsonReader.queryForBlob(entryPath);
            blobJson = JSON.parse(blob.repository.object.text) as [any];
        }

        blobJson.map(this.toValueType).forEach(value => this.collection[value.idNum] = value);
    }

    protected abstract toValueType(json: any) : V;

    async getByIdNum(idNum: number) {
        await this.initialization; // must be done already
        return this.collection[idNum];
    }
}
