import { DaoConstructor } from "./dao";

export function KeyIndexed<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class KeyIndexedDao extends dBase{
        protected collection : {[key : string] : V} = {};
        
        constructor(...args: any[]){
            super(...args);
        }

        protected getByKeys(keys: string[]) {
            return keys.map(key => this.collection[key]);
        }
        protected setByKey(key: string, value: V){
            this.collection[key] = value;
        }
    }
}