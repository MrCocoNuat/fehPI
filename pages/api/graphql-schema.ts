import SchemaBuilder from "@pothos/core";
import { skillDao } from "../../dao/dao-registry";
import { SkillDefinition } from "../../types/dao-types";

const builder = new SchemaBuilder({});

// From TypeScript Types, create ObjectRefs
// then, implement them with GraphQL object/input types
// by choosing which fields to expose and how to resolve them
const SkillDefinitionObject = builder.objectRef<SkillDefinition>("SkillDefinition")
.implement({
    description: "Details about a Skill",
    fields: (t) => ({
        sortId: t.int({resolve: (parent) => parent.sortId}), // nontrivial resolution
        idTag: t.exposeString("idTag"), // simply expose a property as a field
    }),
})

builder.queryType({
    fields: (t) => ({
        hello: t.string({
            args: {
                name: t.arg.string(),
            },
            resolve: (parent, { name }) => `hello, ${name || 'World'}`,
        }),
        skills: t.field({
            args: {
                idNum: t.arg({
                    type: "Int",
                    required: true,
                }),
            },
            type: SkillDefinitionObject,
            resolve: async (parent, {idNum}) => (await skillDao.getByIdNums([idNum]))[0]
        })
    }),
    
});

export default builder.toSchema();