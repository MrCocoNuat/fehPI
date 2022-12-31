import { DaoConstructor } from "./dao";

// specifically for getting image urls from mediawiki
export function MediawikiImage<V, DBase extends DaoConstructor<V>>(typeToken: V, dBase: DBase) {


    return class MediawikiImageDao extends dBase {



    }
}