import { setQueries } from "./query";
import { builder } from "./schema-builder";

setQueries; //TODO- this is a REALLY messed up way to ensure that the query type is set. is there a better one?
//setMutations; // No mutations

export const schema = builder.toSchema();