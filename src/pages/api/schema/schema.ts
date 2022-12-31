import { setMutations } from "./mutation";
import { setQueries } from "./query";
import { builder } from "./schema-builder";

setQueries(); 
setMutations(); // No mutations

export const schema = builder.toSchema();