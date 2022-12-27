import { heroDao, skillDao } from "../../../dao/dao-registry";
import { SkillDefinitionObject, HeroDefinitionObject } from "./object";
import { builder } from "./schema-builder";

export const setQueries =
builder.queryType({
    fields: (t) => ({
        
        // define queries here. This one returns a field (with subfields)
        skills: t.field({
            // its args are a
            args: {
                // [Int!]! named idNums
                idNums: t.arg({
                    type: ["Int"],
                    required: true,
                }),
            },
            // and the return field is a Graphql Object type implemented elsewhere. To get its backing object,
            type: [SkillDefinitionObject],
            // run this resolver given args.
            resolve: async (parent, {idNums}) => (await skillDao.getByIdNums(idNums))
        }),
        
        heroes: t.field({
            args: {
                idNums: t.arg({
                    type: ["Int"],
                    required: true
                }),
            },
            type: [HeroDefinitionObject],
            resolve: async (parent, {idNums}) => (await heroDao.getByIdNums(idNums))
        })
    }),
    
});