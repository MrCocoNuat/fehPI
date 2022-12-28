// typescript needs this to correctly infer the type parameters of generic mixins, 

import { Dao } from "../mixins/dao";
import { GithubSourced } from "../mixins/github-sourced";
import { KeyIndexed } from "../mixins/key-indexed";

// Thanks https://stackoverflow.com/a/57362442
const typeToken = null! as string;

export class MessageDao extends GithubSourced(typeToken, KeyIndexed(typeToken, Dao<string>)){
    
}