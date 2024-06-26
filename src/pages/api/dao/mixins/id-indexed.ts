import { DaoConstructor } from "./dao";


export function IdIndexed<V extends {idNum: number}, DBase extends DaoConstructor<V>>(typeToken: V, dBase : DBase){
    return class IdIndexedDao extends dBase{
        protected collectionIds : {[id : number] : V} = {}; // screw you encapsulation

        constructor(...args: any[]){
            super(...args);
        }

        protected getByIds(ids: number[]) {
            return ids.map(id => this.collectionIds[id]);
        }

        protected setByIds(entries: V[]){
            entries.forEach(entry => this.collectionIds[entry.idNum] = entry);
        }
        
    }
}
