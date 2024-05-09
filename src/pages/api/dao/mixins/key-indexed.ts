import { DaoConstructor } from "./dao";

export function KeyIndexed<V extends {idTag: string}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class KeyIndexedDao extends dBase{
        protected collectionKeys : {[key : string] : V} = {};

        constructor(...args: any[]){
            super(...args);
        }

        protected getByKeys(keys: string[]) {
            return keys.map(key => this.collectionKeys[key]);
        }

        // do not expose this public! For speed, it is a single-key operation
        protected sneakyGetByKey(key: string){
            return this.collectionKeys[key];
        }

        protected setByKeys(entries: V[]){
            entries.forEach(entry => this.collectionKeys[entry.idTag] = entry);
        }
    }
}