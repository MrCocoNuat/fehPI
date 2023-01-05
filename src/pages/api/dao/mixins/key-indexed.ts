import { DaoConstructor } from "./dao";

export function KeyIndexed<V extends {idTag: string}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class KeyIndexedDao extends dBase{
        protected collection : {[key : string] : V} = {};
        
        constructor(...args: any[]){
            super(...args);
        }

        protected getByKeys(keys: string[]) {
            return keys.map(key => this.collection[key]);
        }
        protected setByKeys(entries: V[]){
            entries.forEach(entry => this.collection[entry.idTag] = entry);
        }
    }
}