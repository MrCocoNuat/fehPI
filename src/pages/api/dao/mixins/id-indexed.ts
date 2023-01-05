import { DaoConstructor } from "./dao";

export function IdIndexed<V extends {idNum: number}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class IdIndexedDao extends dBase{
        protected collection : {[id : number] : V} = {};

        constructor(...args: any[]){
            super(...args);
        }

        protected getByIds(ids: number[]) {
            return ids.map(id => this.collection[id]);
        }
        protected setByIds(entries: V[]){
            entries.forEach(entry => this.collection[entry.idNum] = entry);
        }
    }
}
