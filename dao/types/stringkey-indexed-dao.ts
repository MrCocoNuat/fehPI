export interface stringKeyIndexedDao<V>{
    getByStringKeys(stringKeys: string[]) : V[];
}