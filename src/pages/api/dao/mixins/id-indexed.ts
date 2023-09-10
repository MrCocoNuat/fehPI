import { kv } from "@vercel/kv";
import { DaoConstructor } from "./dao";
import {partitionObj} from "../dao-obj-util";

// Write-Once dao: after a get, set operations are rejected 

export function WriteOnceIdIndexed<V extends {idNum: number}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class IdIndexedDao extends dBase{
        private collectionIds : {[id : number] : V} = {};
        private valuesArrayIds? : V[];
        private readOnlyIds = false;

        constructor(...args: any[]){
            super(...args);
        }

        protected getByIds(ids: number[]) {
            this.readOnlyIds = true;
            return ids.map(id => this.collectionIds[id]);
        }

        protected setByIds(entries: V[]){
            if (this.readOnlyIds){
                console.error("IdNum DAO modification attempted after readonly, write rejected");
                return;
            }
            entries.forEach(entry => this.collectionIds[entry.idNum] = entry);
            // entries.forEach(entry => kv.set("TEST" + entry.idNum.toString(), entry)); // try this out
        }

        // very common, cache results
        protected getAllIds(toKv?: boolean){
            if (!this.readOnlyIds && toKv === true){
                const kvToPost = partitionObj(this.collectionIds, 500);
                for (const batch of kvToPost){
                    kv.hset("ALL",batch);    
                }
            }   
            this.readOnlyIds = true;
            if (this.valuesArrayIds === undefined){
                this.valuesArrayIds = Object.values(this.collectionIds);
                console.debug(`dao recorded ${this.valuesArrayIds.length} entries in getAll`);
            }
            return this.valuesArrayIds;
        }

        
    }
}
