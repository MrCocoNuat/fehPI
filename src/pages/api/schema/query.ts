import { growthVectorDao, heroDao, messageDao, skillDao } from "../dao/dao-registry";
import { SkillDefinitionInterface, HeroDefinitionObject, MessageObject } from "./object";
import { builder } from "./schema-builder";
import { LanguageEnum, OptionalLanguageEnum } from "./enum";
import { Language, OptionalLanguage } from "../dao/types/dao-types";


export const setQueries = () => {
    builder.queryType();
    
    builder.queryField("ping", (qfb) => qfb.string({nullable: false, resolve: () => "pong", description: "pong!"}));

    // define queries here. This one returns a field (with subfields)
    builder.queryField("skills", (qfb) => qfb.field({
        description: "Looks up a list of idNums and returns a SkillDefinition for each. Alternatively, if the input is null, returns all known SkillDefinitions.",
        // its args are a
        args: {
            // [Int!]! named idNums
            idNums: qfb.arg({
                type: qfb.arg.listRef("Int", {required: true}),
                required: false,
            }),
        },
        // and the return field is a [Graphql Object type implemented elsewhere]!. To get its backing object,
        type: qfb.listRef(SkillDefinitionInterface, {nullable: true}),
        nullable: false,
        // run this resolver given args.
        resolve: async (parent, {idNums}) => (await (idNums? skillDao.getByIdNums(idNums) : skillDao.getAll())),
    }));
    
    builder.queryField("skillsByTag", (qfb) => qfb.field({
        description: "Looks up a list of idTags and returns a SkillDefinition for each. Note that idTags are not unique - the same skill in different categories will have the same idTag.",
        args: {
            idTags: qfb.arg({
                type: qfb.arg.listRef("String", {required: true}),
                required: true,
            }),
        },
        type: qfb.listRef(SkillDefinitionInterface, {nullable: true}),
        nullable: false,
        resolve: async (parent, {idTags}) => (await skillDao.getByIdTags(idTags))
    }));
    
    builder.queryField("heroes", (qfb) => qfb.field({
        description: "Looks up a list of idNums and returns a HeroDefinition for each. Alternatively, if the input is null, returns all known HeroDefinitions.",
        args: {
            idNums: qfb.arg({
                type: qfb.arg.listRef("Int", {required: true}),
                required: false
            }),
        },
        type: qfb.listRef(HeroDefinitionObject, {nullable: true}),
        nullable: false,
        resolve: async (parent, {idNums}) => (await (idNums? heroDao.getByIdNums(idNums) : heroDao.getAll())),
    }))
    
    builder.queryField("messages", (qfb) => qfb.field({
        description: "Given a Language, Looks up a list of message keys and returns a Message for each. No support for multiple languages in 1 query, because who needs that?",
        args: {
            language: qfb.arg({
                type: LanguageEnum, 
                required: true
            }),
            messageKeys: qfb.arg({
                type: qfb.arg.listRef("String", {required: true}),
                required: true,
            }),
        },
        type: qfb.listRef(MessageObject, {nullable: true}),
        nullable: false,
        resolve: async (parent, {language, messageKeys}) => {
            return await messageDao.getByMessageKeys(language, messageKeys);
        }
    }))

    builder.queryField("growthVectors", (qfb) => qfb.field({
        description: "Returns all 39*64 possible Hero growth vectors. Each bitvector is given as a decimal string (39 bits don't fit an Int) and should be read LSB-first. The 39 bits are given correspond to 39 level-ups.",
        type: qfb.listRef(qfb.listRef("String", {nullable: false}), {nullable: false}),
        nullable: false,
        resolve: async (parent) => await growthVectorDao.getAllGrowthVectors(),
    }))
}
