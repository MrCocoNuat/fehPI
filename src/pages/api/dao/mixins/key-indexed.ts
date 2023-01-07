import { DaoConstructor } from "./dao";

// Write-Once dao: after a get, set operations are rejected 

export function WriteOnceKeyIndexed<V extends {idTag: string}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class KeyIndexedDao extends dBase{
        protected collection : {[key : string] : V} = {};
        private readOnlyKeys = false;

        constructor(...args: any[]){
            super(...args);
        }

        protected getByKeys(keys: string[]) {
            this.readOnlyKeys = true;
            return keys.map(key => this.collection[key]);
        }

        protected setByKeys(entries: V[]){
            if (this.readOnlyKeys){
                console.error("IdNum DAO modification attempted after readonly, write rejected");
                return;
            }
            entries.forEach(entry => this.collection[entry.idTag] = entry);
        }
    }
}