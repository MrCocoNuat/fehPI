import { LanguageEnum } from "./enum";
import { builder } from "./schema-builder";

// unused
export const MessageInput = builder.inputType("MessageInput", {
    fields: (ifm) => ({
        lang: ifm.field({
            type: LanguageEnum,
            required: true
        }),
        messageKey: ifm.string({
            required: true,
        })
    })
})