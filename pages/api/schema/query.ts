import { heroDao, skillDao } from "../../../dao/dao-registry";
import { SkillDefinitionObject, HeroDefinitionObject } from "./object";
import { builder } from "./schema-builder";


export const setQueries = () => {
    builder.queryType();

    // define queries here. This one returns a field (with subfields)
    builder.queryField("skills", (qfb) => qfb.field({
        description: "Looks up a list of idNums and returns a SkillDefinition for each",
        // its args are a
        args: {
            // [Int!]! named idNums
            idNums: qfb.arg({
                type: qfb.arg.listRef("Int", {required: true}),
                required: true,
            }),
        },
        // and the return field is a [Graphql Object type implemented elsewhere]!. To get its backing object,
        type: qfb.listRef(SkillDefinitionObject, {nullable: true}),
        nullable: false,
        // run this resolver given args.
        resolve: async (parent, {idNums}) => (await skillDao.getByIdNums(idNums))
    }));
    
    builder.queryField("heroes", (qfb) => qfb.field({
        description: "Looks up a list of idNums and returns a HeroDefinition for each",
        args: {
            idNums: qfb.arg({
                type: qfb.arg.listRef("Int", {required: true}),
                required: true
            }),
        },
        type: qfb.listRef(HeroDefinitionObject, {nullable: true}),
        nullable: false,
        resolve: async (parent, {idNums}) => (await heroDao.getByIdNums(idNums))
    }))
}
