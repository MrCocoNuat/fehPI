import { heroDao, messageDao, skillDao } from "../../../dao/dao-registry";
import { Language } from "../../../dao/types/dao-types";
import { MessageInput } from "./input";
import { SkillDefinitionObject, HeroDefinitionObject, MessageObject } from "./object";
import { builder } from "./schema-builder";
import { getAllEnumValues } from "enum-for";
import { LanguageEnum } from "./enum";


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
    
    builder.queryField("skillsByTag", (qfb) => qfb.field({
        description: "Looks up a list of idTags and returns a SkillDefinition for each. Note that idTags are not unique - the same skill in different categories will have the same idTag.",
        args: {
            idTags: qfb.arg({
                type: qfb.arg.listRef("String", {required: true}),
                required: true,
            }),
        },
        type: qfb.listRef(SkillDefinitionObject, {nullable: true}),
        nullable: false,
        resolve: async (parent, {idTags}) => (await skillDao.getByIdTags(idTags))
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
        resolve: async (parent, {language, messageKeys}) => (await messageDao.getByMessageKeys(language, messageKeys))
    }))
}
