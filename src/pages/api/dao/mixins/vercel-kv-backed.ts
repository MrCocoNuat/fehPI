import { kv } from "@vercel/kv";
import { DaoConstructor } from "./dao";

export function VercelKvBacked<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase: DBase) {
    return class VercelKvDao extends dBase {
        protected async writeHash(hashName: string, hash: {[key: string|number] : V}){
            const hashToPost = partitionObj(hash, 300);
            for (const batch of hashToPost){
                kv.hset(hashName,batch);    
            }     
        }

        // This bulk operation vastly reduces the number of Vercel KV requests, which otherwise would exhaust all 30k/month in about 20 page loads
        protected async readHash(hashName: string, intendedKeyTypeToken: number | string){
            const result = {} as {[key : string | number] : V}; 
            const keyTransformer = typeof intendedKeyTypeToken === "number"? (s : string) => +s : (s : string) => s;

            const hkeys = await kv.hkeys(hashName);
            const hashKeysToGet = partitionList(hkeys, 300);

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