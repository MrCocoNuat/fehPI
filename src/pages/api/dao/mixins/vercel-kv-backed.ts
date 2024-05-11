import { kv } from "@vercel/kv";
import { DaoConstructor } from "./dao";

const batchSize = 300;

export function VercelKvBacked<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase: DBase) {
    return class VercelKvDao extends dBase {
        // This bulk operation vastly reduces the number of Vercel KV requests, which otherwise would exhaust all 30k/month in about 20 page loads (if there was no server side caching of course)
        protected async readHash(hashName: string, intendedKeyTypeToken: number | string){
            const result = {} as {[key : string | number] : V}; 
            const keyTransformer = typeof intendedKeyTypeToken === "number"? (s : string) => +s : (s : string) => s;

            console.log("reading from " + hashName);

            const hkeys = await kv.hkeys(hashName);
            const hashKeysToGet = partitionList(hkeys, batchSize);

            for (const batch of hashKeysToGet){
                const hash = await kv.hmget(hashName, ...batch);
                if (hash === null){
                    throw Error("retrieved hash was null");
                }
                for (let i = 0; i < batch.length; i++){
                    result[keyTransformer(batch[i])] = hash[batch[i]] as V;
                }
            }

            return result;
        }

        protected async readKeysOfHash(hashName: string, keys: string[], intendedKeyTypeToken: number | string){
            const result = {} as {[key : string | number] : V}; 
            const keyTransformer = typeof intendedKeyTypeToken === "number"? (s : string | number) => +s : (s : string | number) => s;

            console.log("reading from " + hashName);
            // for whatever asinine reason, Vercel's kv library handles nils like shit
            // as in an HMGET that returns even 1 nil value turns the whole return value into null
            // WTF???
            // so filter to extant keys
            const currentKeys = new Set((await kv.hkeys(hashName)).map(key => key.toString()));
            const hashKeysToGet = partitionList(keys.filter(key => currentKeys.has((key))), batchSize);

            // everything else gets undefs

            for (const batch of hashKeysToGet){
                const hash = await kv.hmget(hashName, ...batch);
                if (hash === null){
                    throw Error("retrieved hash was null");
                }
                for (let i = 0; i < batch.length; i++){
                    result[keyTransformer(batch[i])] = hash[batch[i]] as V;
                }
            }

            return result;
        }

        protected async readString(key: string){
            console.log(`reading from ${key}`);
            const result = await kv.get(key) as string;
            return result;
        }
    }   
}

// real useful for POSTing huge hashes to redis - break it up in case the endpoint does not like multi-MB requests
export function partitionObj<V>(obj: {[key : string | number]: V}, maxBatchSize: number) {
    const result = [] as (typeof obj)[];
    let counter = 0;
    let currentBatch = {} as typeof obj;
    for (const key in obj){
        currentBatch[key] = obj[key];
        counter++;
        if (counter == maxBatchSize){
            counter = 0;
            result.push(currentBatch);
            currentBatch = {};
        }
    }
    if (counter != 0){ // don't forget the last batch!
        result.push(currentBatch);
    }
    return result;
}

export function partitionList<T>(list: T[], maxBatchSize: number){
    const result = [] as T[][];
    let counter = 0;
    let currentBatch = [] as T[];
    for (const element of list){
        currentBatch.push(element);
        counter++;
        if (counter == maxBatchSize){
            counter = 0;
            result.push(currentBatch);
            currentBatch = [];
        }
    }
    if (counter != 0){ // don't forget the last batch!
        result.push(currentBatch);
    }
    return result;
}