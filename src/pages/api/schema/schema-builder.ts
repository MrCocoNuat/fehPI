import SchemaBuilder from "@pothos/core";
import DataloaderPlugin from "@pothos/plugin-dataloader";

export const builder = new SchemaBuilder({
    plugins: [DataloaderPlugin],
});;