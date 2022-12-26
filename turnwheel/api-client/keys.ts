import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

// one-time so it is not that bad to synchronously read like 100B of api keys
const loadKeys = () => {
    const keysString = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "keys.json"), "utf-8");
    return JSON.parse(keysString) as {[api: string] : string};
}

function keyForGenerator() {
    console.error("SEEING THIS ON CLIENT SIDE MEANS KEYS ARE BEING LEAKED!!");
    const keysForApis = loadKeys();
    return (apiName : string) => keysForApis[apiName];
}

export const keyFor = keyForGenerator();