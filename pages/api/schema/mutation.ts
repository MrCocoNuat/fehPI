import { builder } from "./schema-builder";

export const setMutations = () => {
    builder.mutationType();
    
    builder.mutationField("noop", (mfb) => mfb.boolean({
        description: "Does absolutely nothing, returns false",
        resolve: () => false
    }));
}