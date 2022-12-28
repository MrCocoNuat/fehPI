import path from "path";
import { GitObjectType } from "../../types/git-types";
import { fehAssetsJsonReader } from "../remote-data/remote-repository";
import { DaoConstructor } from "./dao";

export function GithubSourced<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){ //add the arguments here? kinda violates the spirit of mixins?
    return class GithubSourcedDao extends dBase{
        initialization: Promise<void>;

        protected toValueType!: (json: any) => V;
        protected valueTypeConsumer!: (v: V) => void;
        protected readonly REPO_PATH: string;
        protected readonly TIMER_LABEL: string;

        // bye bye type safety!!
        constructor(...args : any[]){
            super(...(args.slice(1,args.length)));
            const {repoPath, timerLabel} = args[0];
            this.REPO_PATH = repoPath;
            this.TIMER_LABEL = timerLabel;
            this.initialization = this.initialize();
        }

        async initialize() {
            console.time(this.TIMER_LABEL);
            console.log(">>Got repopath:", this.REPO_PATH);
            await this.processTree();
            console.timeEnd(this.TIMER_LABEL);
        }
    
        async processTree() {
            // get all of the files in the tree - these are mostly per-update
            const tree = await fehAssetsJsonReader.queryForTree(this.REPO_PATH);
            const entries = tree.repository.object.entries.filter(entry => entry.type === "blob");
    
            // for each file, get contents
            for (const entry of entries) {
                await this.processBlob(entry);
            }
        }
    
        async processBlob(entry: { name: string; type: GitObjectType; object: { isTruncated: boolean; }}) {
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
    
            blobJson.map(this.toValueType).forEach(this.valueTypeConsumer);
        }

    }
}