import { HeroDefinition, SkillDefinition } from "../../../types/dao-types";
import { builder } from "./schema-builder";

// From TypeScript Types, create ObjectRefs
export const SkillDefinitionObject = builder.objectRef<SkillDefinition>("SkillDefinition")
// then, implement them with GraphQL object/input types
.implement({
    description: "Details about a Skill",
    fields: (t) => ({
        // by choosing which fields to expose directly or resolve with a function
        sortId: t.int({resolve: (parent) => parent.sortId}), // kind of trivial, really
        idTag: t.exposeString("idTag"), 
    }),
})

export const HeroDefinitionObject = builder.objectRef<HeroDefinition>("HeroDefinition")
.implement({
    description: "Details about a Hero",
    fields: (t) => ({
        sortValue: t.exposeInt("sortValue"),
        idTag: t.exposeString("idTag"),
    }),
})
