import path from "path";
import { fehAssetsJsonReader } from "../remote-data/remote-repository";
import { DaoConstructor } from "./dao";

export function GithubSourced<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase: DBase) { //add the arguments here? kinda violates the spirit of mixins?
    return class GithubSourcedDao extends dBase {
        initialization: Promise<void>;

        protected toValueType!: (json: any) => V;
        protected valueTypeConsumer!: (v: V) => void;
        protected readonly REPO_PATH: string;
        protected readonly TIMER_LABEL: string;

        // bye bye type safety!!
        constructor(...args: any[]) {
            super(...(args.slice(1, args.length)));
            const { repoPath, timerLabel } = args[0];
            this.REPO_PATH = repoPath;
            this.TIMER_LABEL = timerLabel;
            this.initialization = this.initialize();
        }

        async initialize() {
            console.time(this.TIMER_LABEL);
            await this.processTree(this.REPO_PATH);
            console.timeEnd(this.TIMER_LABEL);
        }

        async processTree(dirPath: string) {
            // get all of the files in the tree - these are mostly per-update
            const tree = await fehAssetsJsonReader.queryForTree(dirPath);
            const blobEntries = tree.repository.object.entries.filter(entry => entry.type === "blob");
            const treeEntries = tree.repository.object.entries.filter(entry => entry.type === "tree");
            // for each file, get contents
            for (const entry of blobEntries) {
                // awaits not necessary for **eventual** correctness
                await this.processBlob(dirPath, entry);
            }
            // for each subdirectory, recurse
            for (const entry of treeEntries) {
                await this.processTree(path.join(dirPath, entry.name));
            }
        }

        async processBlob(dirPath: string, entry: { name: string; object: { isTruncated: boolean; } }) {
            const entryPath = path.join(dirPath, entry.name);
            let blobJson;

            // always make an ordinary GET request, no point using graphql here
            const blobText = await fehAssetsJsonReader.getRawBlob(entryPath);
            blobJson = JSON.parse(blobText) as [any];

            blobJson.map(this.toValueType).forEach(this.valueTypeConsumer);
        }

    }
}